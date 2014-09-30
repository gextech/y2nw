var _ = require('lodash'),
    fs = require('fs-extra'),
    yaml = require('js-yaml'),
    path = require('path'),
    glob = require('glob'),
    Yadda = require('yadda'),
    coffee = require('coffee-script');

var defaults = _.partialRight(_.assign, function(a, b) {
  return typeof a === 'undefined' ? b : a;
});

var isLiterate = function(file) {
  return (file.indexOf('.litcoffee') > -1) || (file.indexOf('.coffee.md') > -1);
};

function matchVerbs(lang) {
  var expr = _.map(lang.localise('_steps'), function(step) {
    return lang.localise(step);
  });

  var regexp = new RegExp('^(' + expr.join('|') + ').+?$');

  return function(text) {
    return text.match(regexp);
  };
}

function matchParams(text) {
  var matter = text.match(/(-{3})?((.|\n)*?)-{3}/);

  return {
    buffer: matter ? text.substr(matter[0].length) : text,
    params: matter ? ('{' === matter[2].trim().charAt() ? JSON.parse(matter[2]) : yaml.safeLoad(matter[2])) : {}
  };
}

function extractSteps(file, params) {
  var data = matchParams(fs.readFileSync(file).toString()),
      retval = {
        code: '',
        steps: [],
        params: data.params
      };

  function matchCode(text) {
    return text.match(/^\s{4}.+?$/);
  }

  function addStep() {
    retval.steps.push({ code: '', labels: [] });
  }

  function last() {
    return retval.steps[retval.steps.length - 1];
  }

  var current = [],
      lines = data.buffer.split('\n');

  lines.forEach(function(line, offset) {
    var testLine;

    if (line.trim()) {
      if (testLine = params.matchLabel(line)) {
        current.push(testLine[0]);
      } else if (testLine = matchCode(line)) {
        if (current.length) {
          addStep();
          last().labels = current;
          current = [];
        }

        (retval.steps.length ? last() : retval).code += testLine[0] + '\n';
      }
    }
  });

  return retval;
}

function compileScenarios(params) {
  var output = {
    code: {},
    steps: {},
    params: {}
  };

  var steps_dir = path.resolve(params.src + '/steps');

  _.each(glob.sync(steps_dir + '/**/*.{litcoffee,coffee.md}'), function(file) {
    var results = extractSteps(file, params);

    output.params[file] = results.params;
    output.code[file] = results.code;

    output.steps[file] = [];

    _.each(results.steps, function(step) {
      output.steps[file].push({
        code: step.code,
        label: step.labels
      });
    });
  });

  return output;
}

function compileFeatures(params) {
  var parser = new Yadda.parsers.FeatureParser(params.Language);

  return _.object(_.map(new Yadda.FeatureFileSearch(path.resolve(params.src + '/features')).list(), function(file) {
    return [file, parser.parse(fs.readFileSync(file).toString())];
  }));
}

module.exports = function(options) {
  var params = _.merge({}, options);

  defaults(params, {
    language: 'English',
    suffix: 'suitcase'
  });

  params.Language = Yadda.localisation[params.language] || Yadda.localisation.English;
  params.matchLabel = matchVerbs(params.Language);

  var engine = _.template(fs.readFileSync(path.resolve(__dirname + '/_runner.coffee')).toString()),
      library = _.template(fs.readFileSync(path.resolve(__dirname + '/_steps.coffee')).toString());

  var features = compileFeatures(params);

  _.each(features, function(feature, file) {
    var feature_name = path.basename(file).replace('.feature', '') + '-' + params.suffix,
        feature_file = path.resolve(params.dest + '/tests/' + feature_name + '.js'),
        feature_code = coffee.compile(engine(feature), {
          filename: file,
          bare: true
        });

    fs.outputFileSync(feature_file, feature_code);
  });

  var scenarios = compileScenarios(params);

  fs.outputFileSync(path.resolve(params.dest + '/helpers/_steps.js'), coffee.compile(library({
    yadda: require.resolve('yadda'),
    language: params.language,
    scenarios: scenarios
  }), { bare: true }));

  var helpers = path.resolve(params.src + '/helpers');

  if (fs.existsSync(helpers)) {
    _.each(glob.sync(helpers + '/**/*.{js,coffee,coffee.md,litcoffee}'), function(file) {
      var helper_file = path.resolve(params.dest + '/helpers/' + file.replace(helpers, '')),
          ext_match = file.match(/\.(js|coffee(\.md)?|litcoffee)$/)[1];

      helper_file = helper_file.substr(0, helper_file.length - (ext_match.length + 1)) + '.js';

      if ('js' !== ext_match) {
        fs.outputFileSync(helper_file, coffee.compile(fs.readFileSync(file).toString(), {
          literate: isLiterate(file),
          filename: file,
          bare: true
        }));
      } else {
        fs.copySync(file, helper_file);
      }
    });
  }
};

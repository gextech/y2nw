var _ = require('lodash'),
    fs = require('fs-extra'),
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

function extractSteps(file) {
  var lines = fs.readFileSync(file).toString().split('\n'),
      retval = {
        code: '',
        steps: [],
        patterns: {}
      };

  function matchPattern(text) {
    return text.match(/^\$(\w+)\s+(.+?)$/);
  }

  function matchLabel(text) {
    return text.match(/^(\w+\s+.+?)$/);
  }

  function matchCode(text) {
    return text.match(/^\s{4}(.+?)$/);
  }

  function addStep() {
    retval.steps.push({ code: '', labels: [] });
  }

  function last() {
    return retval.steps[retval.steps.length - 1];
  }

  var current = [];

  lines.forEach(function(line, offset) {
    var testLine;

    if (testLine = matchPattern(line)) {
      retval.patterns[testLine[1]] = testLine[2];
    }

    if (line.trim()) {
      if (testLine = matchLabel(line)) {
        current.push(testLine[1]);
      } else if (testLine = matchCode(line)) {
        if (current.length) {
          addStep();
          last().labels = current;
          current = [];
        }

        (retval.steps.length ? last() : retval).code += testLine[1] + '\n';
      }
    }
  });

  return retval;
}

function compileScenarios(params) {
  var output = {
    code: '',
    steps: {},
    patterns: {}
  };

  _.each(glob.sync(path.resolve(params.src + '/steps') + '/**/*.{litcoffee,coffee.md}'), function(file) {
    if (!output.steps[file]) {
      output.steps[file] = [];
    }

    var results = extractSteps(file);

    output.patterns = _.merge({}, output.patterns, results.patterns);
    output.code += results.code;

    _.each(results.steps, function(step) {
      var method = 'define';

      step.labels = _.map(step.labels, function(label) {
        var matchMethod = label.match(/^(given|when|then)\s+/i);

        if (matchMethod) {
          method = matchMethod[1].toLowerCase();

          return label.substr(matchMethod[0].length);
        }

        return label;
      });

      output.steps[file].push({ code: step.code, label: step.labels, method: method });
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

module.exports = function (options) {
  var params = _.merge({}, options);

  defaults(params, {
    language: 'English',
    suffix: 'suitcase'
  });

  params.Language = Yadda.localisation[params.language] || Yadda.localisation.English;

  var engine = _.template(fs.readFileSync(path.resolve(__dirname + '/_engine.coffee')).toString()),
      library = _.template(fs.readFileSync(path.resolve(__dirname + '/_library.coffee')).toString());

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

  var scenarios = compileScenarios(params),
      library_code = library(_.merge({}, params, scenarios, { yadda: require.resolve('yadda') }));

  fs.outputFileSync(path.resolve(params.dest + '/helpers/_library.js'), coffee.compile(library_code, { bare: true }));

  var helpers_dir = path.resolve(params.src + '/helpers');

  if (fs.existsSync(helpers_dir)) {
    _.each(glob.sync(helpers_dir + '/**/*.{js,coffee,coffee.md,litcoffee}'), function(file) {
      var helper_file = path.resolve(params.dest + '/helpers/' + file.replace(helpers_dir, '')),
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

'use strict';

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

var normalize = function(text) {
  return text.replace(/\W+/g, '-')
    .replace(/^-+|-+$/, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase();
};

var $ = {
  isFunction: /^\s+(?:\(.+?\))?\s*->$/,
  isYFM: /(-{3})?((.|\n)*?)-{3}/,
  isLabel: /^([A-Z]\w+\s+[^.]+|\$\S+)\.$/,
  isBlock: /^\s{4}.+?$/,
  isExt: /\.(js|coffee(\.md)?|litcoffee)$/,
  isFn: /^@(?:before|after)(?:Each)?\s+(.+?):$/
};

function matchParams(text) {
  var matter = (text.indexOf('\n---\n') > -1) && text.match($.isYFM);

  return {
    buffer: matter ? text.substr(matter[0].length) : text,
    params: matter ? (matter[2].trim().charAt() === '{' ? JSON.parse(matter[2]) : yaml.safeLoad(matter[2])) : {}
  };
}

function matchLabel(text, lines, offset) {
  var label = text.match($.isLabel);

  if (label) {
    var label_or_blank = lines[offset + 1],
        block_or_something = lines[offset + 2];

    if ((!label_or_blank && (block_or_something && $.isFunction.test(block_or_something))) ||
         (label_or_blank && $.isLabel.test(label_or_blank))) {
      return label;
    }
  }
}

function matchCode(text) {
  return text.match($.isBlock);
}

function matchFn(text) {
  return text.match($.isFn);
}

function extractSteps(file) {
  var data = matchParams(fs.readFileSync(file).toString()),
      retval = {
        code: '',
        steps: [],
        params: data.params,
        callbacks: {}
      };

  function addStep() {
    retval.steps.push({ code: '', labels: [] });
  }

  function last() {
    return retval.steps[retval.steps.length - 1];
  }

  var current = [],
      lines = data.buffer.split('\n'),
      block = false,
      type = '';

  lines.forEach(function(line, offset) {
    var testLine;

    if (line.trim()) {
      testLine = matchLabel(line, lines, offset) || matchFn(line);

      if (testLine) {
        type = '';
        block = false;
        current.push(testLine[1]);

        if (testLine[0].charAt() === '@') {
          type = testLine[0].substr(1, testLine[0].length - 2);
        }
      }

      testLine = matchCode(line);

      if (testLine) {
        if (current.length) {
          if ($.isFunction.test(testLine[0])) {
            block = true;
          }

          if (!type) {
            addStep();
            last().labels = current;
          } else {
            retval.callbacks[type] = '';
          }

          current = [];
        }

        if (type) {
          retval.callbacks[type] += testLine[0] + '\n';
        } else {
          (block ? last() : retval).code += testLine[0] + '\n';
        }
      }
    }
  });

  return retval;
}

function compileScenarios(params) {
  var output = {
    code: {},
    steps: {},
    params: {},
    callbacks: {}
  };

  function loadSteps(from) {
    _.each(glob.sync(path.join(from, '**/*.{litcoffee,coffee.md}')), function(file) {
      var results = extractSteps(file);

      for (var key in results.callbacks) {
        output.callbacks[key] = results.callbacks[key];
      }

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
  }

  loadSteps(path.join(params.src, 'steps'));

  if (params.steps) {
    loadSteps(params.steps);
  }

  return output;
}

function compileFeatures(params) {
  var parser = new Yadda.parsers.FeatureParser(params.Language);

  return _.object(_.map(new Yadda.FeatureFileSearch(path.join(params.src, 'features')).list(), function(file) {
    return [file, parser.parse(fs.readFileSync(file).toString())];
  }));
}

function compileTests(params) {
  params.Language = Yadda.localisation[params.language] || Yadda.localisation.English;

  var suitcase = _.template(fs.readFileSync(path.join(__dirname, '_runner.coffee')).toString()),
      library = _.template(fs.readFileSync(path.join(__dirname, '_steps.coffee')).toString());

  var features = compileFeatures(params),
      scenarios = compileScenarios(params);

  _.each(features, function(feature, file) {
    feature.scenarios.forEach(function(scenario) {
      var feature_name = path.basename(file, '.feature') + '/' + normalize(scenario.title),
          feature_file = path.join(params.dest, 'tests', feature_name + '-' + params.suffix + '.js');

      var feature_code = coffee.compile(suitcase({
        feature: feature,
        scenario: scenario,
        callbacks: scenarios.callbacks
      }), {
        filename: file,
        bare: true
      });

      fs.outputFileSync(feature_file, feature_code);
    });
  });

  fs.outputFileSync(path.join(params.dest, 'helpers/_steps.js'), coffee.compile(library({
    yadda: require.resolve('yadda'),
    header: params.header || '',
    language: params.language,
    scenarios: scenarios
  }), { bare: true }));

  var helpers = path.join(params.src, 'helpers');

  if (fs.existsSync(helpers)) {
    _.each(glob.sync(helpers, '**/*.{js,coffee,coffee.md,litcoffee}'), function(file) {
      var helper_file = path.join(params.dest, 'helpers', path.relative(helpers, file)),
          ext_match = file.match($.isExt)[1];

      helper_file = helper_file.substr(0, helper_file.length - (ext_match.length + 1)) + '.js';

      if (ext_match !== 'js') {
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
}

module.exports = function(options, done) {
  var params = _.merge({}, options);

  done = done || function(err) {
    if (err) {
      throw err;
    }
  };

  defaults(params, {
    language: 'English',
    suffix: 'suitcase'
  });

  try {
    compileTests(params);
    done();
  } catch (e) {
    done(e);
  }
};

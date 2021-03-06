var y2nw = require('./lib');

y2nw({
  prelude: [
    'assert = require("assert")',
    'STATIC = -> "value"'
  ].join('\n'),
  src: __dirname + '/tests',
  dest: __dirname + '/generated',
  steps: __dirname + '/other'
}, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  var suitcase = require(__dirname + '/generated/tests/example/0_testing-only');

  var browser = {
    end: function() {
      console.log('Done.');
    }
  };

  try {
    for (var test in suitcase) {
      if (typeof suitcase[test] === 'function') {
        suitcase[test](browser);
      }
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});

'use strict';

var path = require('path'),
    y2nw = require('../lib');

var root_dir = path.resolve(__dirname + '/..');

y2nw({
  header: 'STATIC = -> "value"',
  src: root_dir + '/tests',
  dest: root_dir + '/generated'
}, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  var suitcase = require(root_dir + '/generated/tests/example-suitcase');

  var browser = {
    end: function() {
      console.log('Done.');
    }
  };

  try {
    for (var test in suitcase) {
      suitcase[test](browser);
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});

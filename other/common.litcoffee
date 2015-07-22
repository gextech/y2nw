---
foo: bar

patterns:
  MULTILINE_TEST: '([^\u0000]*)'
  BIG_PATTERN_TEST: And this test should be executed also
---

    dummy = null

before:

    ->
      console.log 'OK!'

$BIG_PATTERN_TEST.

    ->
      assert.equal params.foo, 'bar'

Given multi-line text $MULTILINE_TEST.

    (text) ->
      dummy = text

Then should equal "$TEXT".

    (subject) ->
      assert.equal dummy, subject.replace(/\\n/g, '\n')

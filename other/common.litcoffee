---
foo: bar

patterns:
  MULTILINE_TEST: '([^\u0000]*)'
  BIG_PATTERN_TEST: And this test should be executed also
---

    dummy = null

@before all:

    ->
      console.log 'before'

@after all:

    ->
      console.log 'after'

@before each:

    ->
      console.log 'beforeEach'

@after each:

    ->
      console.log 'afterEach'

$BIG_PATTERN_TEST.

    ->
      assert.equal params.foo, 'bar'

Given multi-line text\n$MULTILINE_TEST.

    (text) ->
      dummy = text

Then should equal "$TEXT".

    (subject) ->
      assert.equal dummy, subject.replace(/\\n/g, '\n')

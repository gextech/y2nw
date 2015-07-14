---
foo: bar

patterns:
  BIG_PATTERN_TEST: And this test should be executed also
---

$BIG_PATTERN_TEST.

    ->
      assert.equal params.foo, 'bar'

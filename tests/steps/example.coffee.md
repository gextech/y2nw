
    dummy = null
    result = null
    assert = require('assert')

Given a "$input".

    (input) ->
      dummy = input

When I get its "$prop".

    (key) ->
      result = dummy[key]

Then it should return "$output".

    (output) ->
      assert.equal result, output

And STATIC will return "$output" too.

    (output) ->
      assert.equal STATIC(), output

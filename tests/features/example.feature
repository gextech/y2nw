@tags=foo,bar

Feature: Example
Description goes here
and you'll MUST use that!

Scenario: Testing only

  Given a "value"
  When I get its "length"
  Then it should return "5"
  And STATIC will return "value" too
  And this test should be executed also

  Given multi-line text
  ---
  Lorem ipsum dolor
  et sit amet
  ---
  Then should equal "Lorem ipsum dolor\net sit amet"

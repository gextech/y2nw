Yadda2Nightwatch!
=================

Nightwatch is great, but coding such tests is boring:

```javascript
module.exports = {
  "Demo test Google": function (client) {
    client
      .url("http://www.google.com")
      .waitForElementVisible("body", 1000)
      .assert.title("Google")
      .assert.visible("input[type=text]")
      .setValue("input[type=text]", "nightwatch js")
      .waitForElementVisible("button[name=btnG]", 1000)
      .click("button[name=btnG]")
      .pause(1000)
      .assert.containsText("#main", "Node.js powered End-to-End testing framework")
      .end();
  }
};
```

I thought, let's convert some tests into Yadda features and such:

```cucumber
Feature: Demo test Google

Scenario: Open Google and search for "nightwatch js"

  Given at GoogleSearchPage
  When I search for "nightwatch js"
  Then should I see "Node.js powered End-to-End testing framework"
```

Well done, then write some steps for:

```litcoffee
SearchEngine testing
====================

You can write any Literate CoffeeScript here.

    class Page
      constructor: (@browser) ->
        @browser
          .url(@url)
          .waitForElementVisible('body', 1000)

    class SearchEnginePage extends Page
      searchFor: (text) ->
        @browser
          .setValue(@search.input, text)
          .click(@search.submit)
          .pause(1000)

      hasFound: (val) ->
        @browser.assert.containsText(@search.output, val)

    class GoogleSearchPage extends SearchEnginePage
      url: 'http://google.com'

      search:
        input: 'input[type=text]'
        submit: 'button[name=btnG]'
        output: '#ires'

    page = null
    pages = { GoogleSearchPage }

Steps are defined as "one or more sentences, ending with any of `.,;`, followed by a blank-line with a function-block below".

Declared sentences MUST start with any uppercase letter or a dollar sign for allowing custom pattern-matchers.

Note that you can define many sentences as you want but will only take a single code-block for.

Example step-block
------------------

This is a label.
And therefore, another label.

    (some_argument) ->

All step-blocks are required to be followed by a function-block.

If not, the code will be appended after the previous (or current) step-block.

      # I'm a comment inside
      fun = ->
        'BAR'

Finally, our testing steps
--------------------------

Given at $pageName.

    (page_object) ->
      PageClass = pages[page_object]
      page = new PageClass @browser

When I search for "$searchQuery".

    (query_for_search) ->
      page.searchFor query_for_search

Then should I see "$searchResult".

    (text_for_result) ->
      page.hasFound text_for_result
```

That's it.

Library usage
-------------

Precompile your tests with the following code:

```javascript
var y2nw = require('y2nw');

y2nw({
  language: 'English',
  src: __dirname + '/tests',
  dest: __dirname + '/generated'
}, function(err) {
  if (err) {
    console.log(err);
  }

  console.log('OK');
});
```

Now you can execute the generated tests with **Nightwatch** or [grunt-nightwatch](https://github.com/gextech/grunt-nightwatch).


Build status
------------

[![Build Status](https://travis-ci.org/gextech/y2nw.png?branch=master)](https://travis-ci.org/gextech/y2nw)

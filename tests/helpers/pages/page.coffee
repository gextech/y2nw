class Page
  constructor: (@browser) ->
    @browser
      .url(@url)
      .waitForElementVisible('body', 1000)

  searchFor: (text) ->
    @browser
      .setValue(@search.input, text)
      .click(@search.submit)
      .pause(1000)

  hasFound: (val) ->
    @browser.assert.containsText(@search.output, val)

module.exports = Page

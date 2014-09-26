__yadda = require('../helpers/_library')

module.exports =

<% _.each(scenarios, function (scenario) { %>
  <%= JSON.stringify(scenario.title) %>: (browser) ->
    __yadda.yadda <%= JSON.stringify(scenario.steps) %>, { browser }
<% }) %>

    browser.end()

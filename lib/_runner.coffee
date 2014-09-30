__run = require('../helpers/_steps')

module.exports =

<% _.each(scenarios, function (scenario) { %>
  <%= JSON.stringify(scenario.title) %>: (browser) ->
    __run <%= JSON.stringify(scenario.steps) %>, { browser }
<% }) %>

    browser.end()

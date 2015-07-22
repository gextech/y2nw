###
<%= title %>
<% if (description) { %>
<%= description.join('\n') %>
<% } %>
###

__run = require('../helpers/_steps')

module.exports =
  '@tags': <%= JSON.stringify(annotations.tags.split(/\W/)) %>
  '@disabled': <%= annotations.skip ? 'true' : 'false' %>

<% _.each(scenarios, function (scenario) { %>
  <%= JSON.stringify(scenario.title) %>: (browser) ->
    __run <%= JSON.stringify(scenario.steps) %>, { browser }
<% }) %>

    browser.end()

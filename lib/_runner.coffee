###
<%= feature.title %>
<% if (feature.description) { %>
<%= feature.description.join('\n') %>
<% } %>
###

__run = require('../../helpers/_steps')

module.exports =
  '@tags': <%=
    JSON.stringify(_.filter((feature.annotations.tags || '')
      .split(/[^\w_-]/)
      .concat((scenario.annotations.tags || '')
        .split(/[^\w_-]/))))
  %>
  '@disabled': <%= feature.annotations.skip || scenario.annotations.skip ? 'on' : 'off' %>

<% _.each(['before', 'after'], function (prefix) { %>
<% if (feature.annotations[prefix] && callbacks[prefix + ' ' + feature.annotations[prefix]]) { %>
  <%= prefix %>:
<%= callbacks[prefix + ' ' + feature.annotations[prefix]] %><% } %>

<% if (scenario.annotations[prefix] && callbacks[prefix + ' ' + scenario.annotations[prefix]]) { %>
  <%= prefix %>Each:
<%= callbacks[prefix + ' ' + scenario.annotations.before] %><% } %>
<% }); %>

<% _.each(scenario.steps, function (step) { %>
  <%= JSON.stringify(step) %>: (browser) ->
    __run <%= JSON.stringify(step) %>, { browser }
<% }) %>

    browser.end()

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
      .split(/\W/)
      .concat((scenario.annotations.tags || '')
        .split(/\W/))))
  %>
  '@disabled': <%= feature.annotations.skip || scenario.annotations.skip ? 'on' : 'off' %>

<% if (feature.annotations.before && callbacks['before ' + feature.annotations.before]) { %>
  before:
<%= callbacks['before ' + feature.annotations.before] %><% } %>

<% if (scenario.annotations.before && callbacks['before ' + scenario.annotations.before]) { %>
  beforeEach:
<%= callbacks['before ' + scenario.annotations.before] %><% } %>

<% if (scenario.annotations.after && callbacks['after ' + scenario.annotations.after]) { %>
  afterEach:
<%= callbacks['after ' + scenario.annotations.after] %><% } %>

<% if (feature.annotations.after && callbacks['after ' + feature.annotations.after]) { %>
  after:
<%= callbacks['after ' + feature.annotations.after] %><% } %>

<% _.each(scenario.steps, function (step) { %>
  <%= JSON.stringify(step) %>: (browser) ->
    __run <%= JSON.stringify(step) %>, { browser }
<% }) %>

    browser.end()

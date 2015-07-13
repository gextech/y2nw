__Yadda = require('<%= yadda %>')

__library = __Yadda.localisation
  .<%= language %>.library(new __Yadda.Dictionary())

<%= header %>

__steps =
<% _.each(scenarios.steps, function(steps, file) { %>
  <%= JSON.stringify(file) %>: ->

<% _.each(scenarios.params[file].patterns, function(pattern, name) { %>
    .define('<%= name %>', <%= pattern.indexOf('$') > -1 ? JSON.stringify(pattern) : '/' + pattern + '/' %>)
<% }) %>

<%= scenarios.code[file] %>

    __library

<% _.each(steps, function(step) { %>
    .define <%= JSON.stringify(step.label) %>,
<%= step.code %>
      undefined
<% }) }) %>

module.exports = ->
  __setup() for __file, __setup of __steps
  new __Yadda.Yadda(__library).yadda arguments...

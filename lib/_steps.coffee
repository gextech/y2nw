__Yadda = require('<%= yadda %>')

<%= header %>

__steps =
<% _.each(scenarios.steps, function(steps, file) { %>
  <%= JSON.stringify(file) %>: ->
    __dictionary = new __Yadda.Dictionary()

<% _.each(scenarios.params[file].patterns, function(pattern, name) { %>
    .define('<%= name %>', <%= pattern.indexOf('$') > -1 ? JSON.stringify(pattern) : '/' + pattern + '/' %>)
<% }) %>

<%= scenarios.code[file] %>

    __library = __Yadda.localisation.<%= language %>.library(__dictionary)

<% _.each(steps, function(step) { %>
    .define <%= JSON.stringify(step.label) %>,
<%= step.code %>
      undefined
<% }) }) %>

module.exports = ->
  for __file, __setup of __steps
    new __Yadda.Yadda(__setup()).yadda arguments...

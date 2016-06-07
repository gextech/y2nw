__Yadda = require('<%= yadda %>')

__dictionary  = new __Yadda.Dictionary()

__library = __Yadda.localisation
  .<%= language %>.library(__dictionary)

<%= prelude %>

__steps =
<% _each(scenarios.steps, function(steps, file) { %>
  <%= JSON.stringify(file) %>: ->

    params = <%= JSON.stringify(_omit(scenarios.params[file], 'patterns')) %>

    __dictionary
<% _each(scenarios.params[file].patterns, function(pattern, name) { %>
    .define('<%= name %>', <%= pattern.indexOf('$') > -1 ? JSON.stringify(pattern) : '/' + pattern + '/' %>)
<% }) %>

<%= scenarios.code[file] %>

    __library
<% _each(steps, function(step) { %>
    .define <%= JSON.stringify(step.label) %>,
<%= step.code %>

<% }) }) %>

__setup() for __file, __setup of __steps
__run = new __Yadda.Yadda(__library)

__hooks = []

<% _each(hooks, function(file) { %>
__hooks.push(require(<%= JSON.stringify(file) %>))
<% }) %>

module.exports = (step, browser, feature, scenario) ->
  __hooks.forEach (cb) -> cb?.call browser, feature, scenario
  __run.yadda step, { browser }

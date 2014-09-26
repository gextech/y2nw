<%= code %>

__Yadda = require('<%= yadda %>')
__dictionary = new __Yadda.Dictionary()

<% _.each(patterns, function(pattern, name) { %>
.define('<%= name %>', <%= pattern.indexOf('$') > -1 ? JSON.stringify(pattern) : '/' + pattern + '/' %>)
<% }) %>

__library = __Yadda.localisation.<%= language %>.library(__dictionary)

<% _.each(steps, function(set, file) { _.each(set, function(step) { %>
.<%= step.method %> <%= JSON.stringify(step.label) %>, <%= step.code %>
<% }) }) %>

module.exports = new __Yadda.Yadda __library

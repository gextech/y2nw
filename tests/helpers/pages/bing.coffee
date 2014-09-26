Page = require('./page')

class BingSearch extends Page
  url: 'http://bing.com'

  search:
    input: 'input[type=search]'
    submit: 'input[type=submit]'
    output: '#b_results'

  module.exports = BingSearch

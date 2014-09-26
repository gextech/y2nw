Page = require('./page')

class GoogleSearch extends Page
  url: 'http://google.com'

  search:
    input: 'input[type=text]'
    submit: 'button[name=btnG]'
    output: '#ires'

module.exports = GoogleSearch

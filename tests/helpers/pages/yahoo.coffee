Page = require('./page')

class YahooSearch extends Page
  url: 'http://yahoo.com'

  search:
    input: 'input[type=text]'
    submit: '#search-submit'
    output: '#main'

module.exports = YahooSearch

pages =
  BingSearch: require('./pages/bing')
  YahooSearch: require('./pages/yahoo')
  GoogleSearch: require('./pages/google')

module.exports =
  pageFactory: (className, browserInstance) ->
    PageClass = pages[className]
    new PageClass(browserInstance)

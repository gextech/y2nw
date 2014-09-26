
    page = null
    util = require('../helpers')

Given @$CLASS

    (page_object) ->
      page = util.pageFactory page_object, @browser

When I search for "$TEXT"

    (query_for_search) ->
      page.searchFor query_for_search

Then should I see "$TEXT"

    (text_for_result) ->
      page.hasFound text_for_result

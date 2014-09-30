---
patterns:
  searchEngine: "@$CLASS"
  searchQuery: '"$TEXT"'
---

Testing suitcase
================

    page = null
    util = require('../helpers')

Given $searchEngine.

    (page_object) ->
      page = util.pageFactory page_object, @browser

When I search for $searchQuery.

    (query_for_search) ->
      page.searchFor query_for_search

Then should I see $searchQuery.

    (text_for_result) ->
      page.hasFound text_for_result

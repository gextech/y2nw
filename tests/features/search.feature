Feature: Nightwatch Example

Scenario: Open [Engine] and search for "[Term]"

    Given @[Engine]Search
    When I search for "[Term]"
    Then should I see "[Result]"

    Examples:
      Engine | Term            | Result
      Google | nodejs          | nodejs.org
      Google | selenium        | Web Browser Automation
      Yahoo  | nightwatch js   | beatfactor/nightwatch
      Bing   | Grupo Expansión | grupoexpansion.mx

# Bugs

- Inline items in digests don't have their "seen" update as expected.

# Features

- Interface for setting API keys.
- Usage statistics.
- Warnings for high LLM usage (e. g. before trying to make a digest from thousands of items).

## Improve digests

- Store digests in database, and only update them on certain events.
  - Updates to downstream blocks (new items, new digests) + button to force update.
- Add properties to digests
  - read by user
- Think about how to implement a recursive digest, to keep track of important information in between user reads.
- Allow a digest to use specific stored versions of itself as input. For example, yesterdays digest: this can be useful for a digest that updates each day with the most important events since last time the user read it, and resets when the
  - One way to do this would be to think of digests as entries in a Digests db table, and use queries to fetch them

## Add or develop sources

To add:

- Email newsletters

These would be nice but are infeasible at the moment:

- Summarization for NYT via login. Technically works, but goes against tos and they have detectors.
- Getting tweets from people you follow on X. Can be done via API, but the free tier only supports up to 100 reads per month and non-free tiers start at $200/month. Scraping have same issues as NYT.

# Other

- Change filter LLM calls to use OpenAI's batch API endpoint.

# Features

- Interface for setting API keys.
- Usage statistics.
- Warnings for high LLM usage (e. g. before trying to make a digest from thousands of items).
  - For this, maybe best to create a small wrapper for LLM calls?

## Improve digests

- Store digests in database, and only update them on certain events.
  - Updates to downstream blocks (new items, new digests) + button to force update.
- Add properties to digests
  - read by user
- Think about how to implement a recursive digest, to keep track of important information in between user reads. Perhaps by feeding stored versions of a digest into itself + new items?

## Add or develop sources

To add:

- Email newsletters

These would be nice but are infeasible at the moment:

- Summarization for NYT via login. Technically works, but goes against tos and they have detectors.
- Getting tweets from people you follow on X. Can be done via API, but the free tier only supports up to 100 reads per month and non-free tiers start at $200/month. Scraping have same issues as NYT.

# Other

- Change filter LLM calls to use OpenAI's batch API endpoint.

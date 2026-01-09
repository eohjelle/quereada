# Bugs

- Inline items in digests don't have their "seen" update as expected.

# Features

- Modular design of digests, making it easier to customize prompts (i. e. it's not a const hidden away in the middle of a file somewhere).
- Interface for setting API keys.
- Usage statistics.
- Warnings for high LLM usage (e. g. before trying to make a digest from thousands of items).

## Add or develop sources

To add:

- Email newsletters

These would be nice but are infeasible at the moment:

- Summarization for NYT via login. Technically works, but goes against tos and they have detectors.
- Getting tweets from people you follow on X. Can be done via API, but the free tier only supports up to 100 reads per month and non-free tiers start at $200/month. Scraping have same issues as NYT.

# Other

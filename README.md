Querygator is a news and media aggregator which offers unparalleled customization and advanced features.
Click here (todo: link) to see a demo.

Querygator works by:

1. _Aggregating_ new items such as articles and videos from various sources on the internet. Any RSS feed has basic support, but some sources have extra support with features such as the ability to summarize articles. In principle, anything on the internet can be a source, and the design of the codebase makes it easy to add custom support for additional sources.
2. Building feeds using _queries_ defined in a config file, where it is possible to filter by properties such as source, date published, authors, unseen, number of words,nnumber of likes, clicked items, and more. An advanced feature is the ability to filter items by their relevance to groups of topics.

What sets Querygator apart from other news aggregators and RSS readers? Unlike most news aggregators with automatic suggestions, Querygator offers you much more control over what you see. The philosophy behind this app is to let editors of newspapers, and not an algorithm, make most decisions about what your daily feed should look like. But at the same time, Querygator allows you to combine and filter these feeds in ways that makes it much more customizable than most RSS readers.

# Installation

There is no standalone app at the moment, but you can host it locally and access the app in a web browser.

# Contributing

# To do list

#todo

- [x] Enable config file `config.ts` to define the feeds.
- [x] Make config reload on refresh.
- [ ] Enable checking relevance of item to topic groups on demand. (Currently, this is done when fetching new items from the sources. Note that the check is only being done for items and topic groups that appear together in a feed, so many superfluous calls to the OpenAI API are not being made.)
- [x] Migrate database to postgres
- [x] Host project online. Use Heroku?
- [ ] Write instructions for installation.
- [ ] Enable automatic refresh every n minutes. Make sure

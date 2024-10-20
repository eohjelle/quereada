# About

Quereada is a news and media aggregator which offers a high degree of control and customization, as well as advanced features.
[Click here](https://quereada-342c36fe2c15.herokuapp.com) to see a demo.

Quereada works by:

1. _Aggregating_ new items such as articles and videos from various sources on the internet. RSS feeds have basic support, but in principle, anything on the internet can be a source, and the design of the codebase makes it easy to add custom support for additional sources.
2. Building feeds using _queries_ defined in a config file, where it is possible to filter by properties such as source, date published, authors, whether the item has been seen or clicked before, number of words, number of likes, and more. It is even possible to filter items by their relevance to any topic.

## What sets Quereada apart from other news aggregators and RSS readers?

Unlike most news aggregators with automatic suggestions, Quereada offers you much more control over what you see. The philosophy behind this app is to let editors of newspapers, and not an algorithm, make most decisions about what your daily feed should look like. But at the same time, Quereada allows you to combine and filter these feeds in ways that makes it much more customizable than most RSS readers. It is also open source, so you can make a fork of the project tailored to your own preferences.

## AI-powered features

Quereada's most advanced features, namely summarization and topic classification, are powered by LLMs. However, care has been made to not to use these powerful tools for tasks where they are not needed, such as scraping websites for content, because this would be a waste of resources.

# How to use

There is no standalone app at the moment, but you can host it locally and access the app in a web browser.

# Installation

This program can run as a web app that can be accessed in a web browser, or as a desktop app that runs natively on your machine. It is recommended to run it as a desktop app, but the choice is yours. Depending on your choice, follow the instructions below.

## Desktop installation

### API keys

The app will look for API keys in a `userData` folder, which defaults to `~/.config/quereada` on Linux, `~/Library/Application Support/quereada` on macOS, and `AppData\Roaming\quereada` on Windows. Specifically, it will look for a file called `api_keys.json`. Inside, you should have keys for the services you want to use. For example:

```userData/api_keys.json
{
    "OPENAI_API_KEY": "sk-proj-...",
    "NYTIMES_API_KEY": "..."
}
```

At the moment, `OPENAI_API_KEY` is the only key that is required.

#todo Create an interface for setting API keys.

### Building from source

## Web installation

### Environment variables

### Starting the app

1. `npm run build:web`
2. `npm run start:web`

# Customization

Now that you have the app up and running, you can customize it to your liking.

## Writing `quereada.config.ts`

## Adding new sources

## Creating filters

# Contributing

# To do list

#todo

- [x] Enable config file `config.ts` to define the feeds.
- [x] Make config reload on refresh.
- [ ] Move relevance checks "closer to the database".
  - [ ] Enable checking relevance of item to topic groups on demand. (Currently, this is done when fetching new items from the sources. Note that the check is only being done for items and topic groups that appear together in a feed, so many superfluous calls to the OpenAI API are not being made.)
- [x] Migrate database to postgres
- [x] Host project online. Use Heroku?
- [ ] Finish README
- [ ] Enable automatic refresh every n minutes. Make sure this doesn't lead to conflicts when someone is using the site at the same time.
- [ ] Refactor loading mechanism: use slot props
- [ ] Enable summarization for NYTimes (may need captcha popup)
- [ ]

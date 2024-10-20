# Quereada

Quereada provides a deeply customizable way to engage with content on the internet.
[Click here](https://quereada-342c36fe2c15.herokuapp.com) to see a demo.
Quereada is open-source and will always be free to use.

## How it works

Quereada works by:

1. Collecting new items such as articles, links, and videos from various _sources_ on the internet. It is easy to use RSS feeds and API endpoints as sources, but in principle, anything on the internet can be used as a source.
2. Building feeds using _queries_ to a database of collected items. These queries are defined in a configuration file, which controls the available feeds. Feeds can be described and ordered in terms of properties such as source, date published, authors, whether the item has been seen or clicked before, number of words, number of likes, and more.
3. Adding additional _filters_ on top of the queries. For example, it is possible to filter items by whether or not they are relevant to any topic.

It is easy for anyone to use Quereada, but at the time of writing, the initial setup requires some technical knowledge.

## Philosophy

There are already a myriad of RSS readers and news aggregators out there, so what sets Quereada apart? It is the unique blend of guiding principles
that leads to its distinctive quality:

- The items are sourced from trusted content creators, and not a black box algorithm. In this way, Quereada is closer to a traditional news outlet or an RSS reader than most news aggregators.
- Instead of being locked into a format like RSS, which is not supported by many websites, Quereada makes it easy to add support for any source on the internet.
- Build customized feeds using queries to a database of items, instead of using each source as its own feed.
- Enable the option to add additional filters on top of the queries, such as filtering by topic, to further customize the feeds.

# Installation

There are currently two ways to use Quereada:

1. As a desktop app that runs natively on your machine (recommended).
2. As a self hosted web app that can be accessed in a web browser.

Depending on your choice, follow the instructions below.

## Desktop installation

For some systems, releases are available on the [Releases](https://github.com/quereada/quereada/releases) page. If you install from one of these releases, you can skip the "Build from source" section.

### Build from source

The first step is to clone the repository to a folder on your machine:

```bash
git clone https://github.com/eohjelle/quereada.git
```

Then, install the dependencies (this requires [Node.js](https://nodejs.org) to be installed on your machine) in the root folder of the project:

```bash
npm install
```

Before building the app, you need to create the SQLite database:

```bash
npm run db:build
```

_Note:_ If you are making a release for a different platform than the one you are on, you will need to modify the Prisma schema to use the correct database driver. See [here](https://github.com/prisma/prisma/discussions/21027) for some discussion.

Finally, you can build the app based on your platform:

- Mac: `npm run electron:package:mac`

The app will be built and placed in the `dist` folder.

### Configuration

Both the API keys and feed configuration are located in the `userData` folder, which defaults to `~/.config/quereada` on Linux, `~/Library/Application Support/quereada` on macOS, and `AppData\Roaming\quereada` on Windows. Specifically, it will look for the following files:

- `api_keys.json`
- `quereada.config.ts`

See the sections below for more information about what each file is for.

#todo Create an interface for setting API keys.

## Web installation

### Setup

The first step is to clone the repository to a folder on your machine:

```bash
git clone https://github.com/eohjelle/quereada.git
```

Then, install the dependencies (this requires [Node.js](https://nodejs.org) to be installed on your machine) in the root folder of the project:

```bash
npm install
```

Before building the app, you need to create the database. By default, this is an SQLite database named `store.db` in the root folder of the project. But if you prefer to use PostgreSQL, you can change the database driver in the `prisma/schema.prisma` file and set the database URL in the `.env` file in the root folder of the project. To set up the initial database schema, run the following command:

```bash
npm run db:build
```

Build the app:

```bash
npm run web:build
```

Run the app:

```bash
npm run web:start
```

### Configuration

The app will look for API keys and other environmental variables in a file called `.env` in the root folder of the project. The `quereada.config.ts` file which controls the feeds is also in the root folder of the project.

# Keys

Some services require keys. Depending on whether you use the desktop or web version, you will set the keys in different ways -- see "Configuration" in the sections above.

Here is a list of the keys you can set:

| Key             | Service                 | Required?                                                          |
| --------------- | ----------------------- | ------------------------------------------------------------------ |
| OPENAI_API_KEY  | OpenAI                  | Yes, but this requirement should be removed in the future.         |
| NYTIMES_API_KEY | NYTimesAPI source class | No in general, but required with the `quereada.config.ts` template |

_Note:_ Usage of Quereada may incur costs with the services listed above. For example, the default implementation of summarization features and topic relevance checks uses the OpenAI API. However, a lot of care has been taken to ensure that the number of requests is minimized. For example, items are only summarized upon request, and filters are only applied when a feed is being loaded.

# Customization

After setting up the app, you can customize it to your liking.

#todo Add more detailed information.

## Writing `quereada.config.ts`

The `quereada.config.ts` file controls the feeds. It needs to export the following constants:

- `sources`: An array of `ConfigSource` objects.
- `filters`: An array of `ConfigFilter` objects.
- `blocks`: An array of `ConfigBlock` objects. (A block is a part of a feed: a feed composed of multiple blocks show all items in the first block, then all items in the second block, etc.)
- `feeds`: An array of `ConfigFeed` objects.

It is recommended to edit this file by cloning the project, and modifying the copy of `quereada.config.ts` in the root folder of the project. This ensures that you get syntax highlighting and error checking as you type (if using a modern editor with TypeScript support).

## Adding new source classes

A source class is an implementation of the `Source` class in `modules/sources`, which tells Quereada how to fetch items from a particular source. You can add your own source classes to `modules/sources/implementations`.

## Creating filters

A filter is an implementation of the `Filter` type in `modules/filters`. Essentially, a filter is essentially a function which takes as input an item and outputs a boolean (true if the item passes the filter, false otherwise). You can add your own filter classes to `modules/filters/implementations`.

# Features in development

- Add support for more sources:
  - [ ] More news outlets (e. g. Financial Times, The Guardian, etc.)
  - [ ] Email newsletters
  - [ ] Twitter/X (users as channels)
  - [ ] Reddit (subreddits as channels)
  - [ ] YouTube
- Improve support for current sources:
  - [ ] Improve general RSS support by extracting more information from RSS feeds.
  - [ ] Enable summarization of NYTimes articles (will require a subscription to NYTimes and captcha solving).

# Disclaimer

I am not a professional software engineer, and I built Quereada as a personal project. I built it because it was a program that I would like to use myself, and share with others.

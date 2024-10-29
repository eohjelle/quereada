# Quereada

Quereada is an open-source and free to use app that provides tools to build your own feeds from the internet and display them in an elegant interface. It is available as a desktop app or self-hosted web app.
[Click here](https://quereada-342c36fe2c15.herokuapp.com) to see a demo.

Quereada is similar to many RSS readers, but with the twist that feeds are built from queries to a database of items, instead of using each source as its own feed. This makes Quereada more flexible and customizable than most RSS readers. In more detail, Quereada works by:

1. Collecting new _items_ (articles, links, videos, etc.) from various _sources_ (RSS feeds, API endpoints, websites, etc.) on the internet.
2. Building feeds using _queries_ to the database of collected items. Feeds can be defined and ordered in terms of properties such as source, date published, authors, whether the item has been seen or clicked before, number of words, number of likes, and more.
3. Adding additional _filters_ on top of the queries. For example, it is possible to filter items by whether or not they are relevant to any topic.

Some services such as summarization or filtering by relevance to topics rely on external APIs. To use these services it is necessary to provide API keys, and costs may apply. However, Quereada is designed to minimize the number of requests, and to store the results of requests to avoid making duplicate requests.

# How to use

It is easy for anyone to use Quereada, but at the time of writing, the initial setup requires some technical knowledge.

There are currently two options for using Quereada:

1. As a desktop app that runs natively on your machine (recommended).
2. As a self-hosted web app that can be accessed in a web browser.

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

Quereada looks for keys and feed configuration in the `userData` folder, which defaults to `~/.config/quereada` on Linux, `~/Library/Application Support/quereada` on macOS, and `AppData\Roaming\quereada` on Windows. Specifically, Quereada will look for the following files in the `userData` folder:

- `keys.json`
- `quereada.config.ts`

See the sections below for more information about what each file is for.

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

Before building the app, you need to create the database. By default, this is an SQLite database named `store.db` in the root folder of the project. But if you prefer to use PostgreSQL, you can change the database driver in the `schema.prisma` file and set `DATABASE_URL` in the `.env` file in the root folder of the project. To set up the initial database schema, run the following command:

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

## Keys

Some services require keys. Depending on whether you use the desktop or web version, you will set the keys in different ways -- see "Configuration" in the sections above.

Here is a list of the keys you can set:

| Key             | Service                 | Required?                                                          |
| --------------- | ----------------------- | ------------------------------------------------------------------ |
| OPENAI_API_KEY  | OpenAI                  | Yes, but this requirement should be removed in the future.         |
| NYTIMES_API_KEY | NYTimesAPI source class | No in general, but required with the `quereada.config.ts` template |

_Note:_ Usage of Quereada may incur costs with the services listed above. For example, the default implementation of summarization and topic relevance checks uses the OpenAI API. However, the software is designed to minimize the number of requests. For example, items are only summarized upon request, and filters are only applied when a feed using that filter is being loaded. Moreover, the results of summarization requests and topic relevance checks are stored, so that they are applied at most once per item.

## Customization

After setting up the app, you can customize it to your liking.

#todo Add more detailed information.

### Writing `quereada.config.ts`

The `quereada.config.ts` file controls the feeds. It needs to export the following constants:

- `sources`: An array of `ConfigSource` objects.
- `filters`: An array of `ConfigFilter` objects.
- `blocks`: An array of `ConfigBlock` objects. (A block is a part of a feed: a feed composed of multiple blocks show all items in the first block, then all items in the second block, etc.)
- `feeds`: An array of `ConfigFeed` objects.

It is recommended to edit this file by cloning the project, and modifying the copy of `quereada.config.ts` in the root folder of the project. This ensures that you get syntax highlighting and error checking as you type (if using a modern editor with TypeScript support).

### Adding new source classes

A source class is an implementation of the `Source` class in `modules/sources`, which tells Quereada how to fetch items from a particular source. You can add your own source classes to `modules/sources/implementations`.

### Creating filters

A filter is an implementation of the `Filter` type in `modules/filters`. A filter is essentially a function which takes as input an item and outputs a boolean (true if the item passes the filter, false otherwise). You can add your own filter classes to `modules/filters/implementations`.

# Features in development

#todo

- [ ] Interface for setting API keys.
- [ ] Interface for setting feed configuration.
- [ ] Usage statistics.
- Add support for more sources:
  - [ ] Email newsletters
  - [ ] Major platforms (YouTube, Reddit, Twitter/X)
- Improve support for current sources:
  - [ ] Enable summarization of NYTimes articles (will require a subscription to NYTimes and captcha solving).

# Disclaimer

I built Quereada as a personal project, because it was a product that I wanted to use and share with others, and because I wanted to learn about full-stack development. However, I'm not a professional software engineer, so some design choices in the project may be non-standard.

If you would like to contribute to the project, please do not hesitate to contact me.

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

# Quirks

- Relevance of items to topic group is checked when fetching new items (however, only )

# To do list

- [x] Enable config file `config.ts` to define the feeds.
- [x] Make config reload on refresh.
- [ ] Enable checking relevance of item to topic groups on demand. (Currently, this is done when fetching new items from the sources. Note that the check is only being done for items and topic groups that appear together in a feed, so many superfluous calls to the OpenAI API are not being made.)
- [ ] Migrate database to postgres
- [ ] Host project online. Use Heroku?

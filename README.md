# FPL Forfeit Tracker

This project is a small Nuxt application that fetches data from the
[Official FPL API](https://fantasy.premierleague.com/api) and displays your
league standings every four weeks. It highlights the lowest scoring manager
for each period so you can easily see who has to carry out a forfeit.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/nuxtjs&template=nuxtjs)

_Live Example: https://nuxtjs-template.vercel.app_

Look at the [Nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

Set your league id in an environment variable so the API route knows which
league to query:

```bash
export LEAGUE_ID=<your_league_id>
```


## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

Make sure the `LEAGUE_ID` environment variable is set in the same terminal
before starting the dev server so the API route can fetch your league data.

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment#presets) for more information.

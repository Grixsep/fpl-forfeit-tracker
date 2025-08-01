# FPL Forfeit Tracker

This website helps automate forfeits in your Fantasy Premier League (FPL) by tracking league results every 4 weeks. It uses the official FPL API and your league ID to fetch live data and determine who's due a punishment.

Built with [Once UI](https://once-ui.com) and Next.js for a clean, modern interface.

## How it works

- Every 4 gameweeks, the site checks who's at the bottom
- The loser gets a forfeit - tracked and displayed on the site
- Follow setup the setup below

## Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/fpl-forfeit-tracker.git
   cd fpl-forfeit-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create .env.local:

   Create a file called ".env.local" and set the variable to your league ID.
   See .env.example for more info.

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Deployment

Deploy easily with Vercel or any Next.js-compatible platform.

## Notes

- You'll need your FPL league ID — you can find this in your league's URL.
- This is just for fun — not affiliated with the official FPL.

# Thurowell — Mental Performance System

## Overview

Thurowell is a wellness web app that recommends breathwork and meditation protocols based on your current mental state. It is not a medical device and does not diagnose or treat any condition.

## How It Works

1. User enters stress, energy, and focus levels (1–10) and selects a goal
2. A rule-based classifier maps the input to an optimal protocol
3. The app explains the recommendation and walks through the steps
4. Session feedback is stored locally for personal tracking

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage for session persistence

## Architecture

- types/index.ts — shared data types
- lib/protocols.ts — protocol library (6 evidence-based techniques)
- lib/recommend.ts — rule-based recommendation engine
- lib/storage.ts — localStorage abstraction layer
- components/ — UI components
- app/ — Next.js pages

## Local Development

npm install

npm run dev

## Deployment

Deployed on Vercel. Connect your GitHub repo and Vercel auto-deploys on every push.

## Future Roadmap

- Supabase persistence + user accounts
- Guided timer with step-by-step audio cues
- Trend charts from session history
- OpenAI integration for personalized protocol explanations

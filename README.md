# Grammar Simplification Tool

A web app for visualizing context-free grammar simplification step-by-step.

## Features

- Remove useless symbols (non-generating and unreachable)
- Eliminate null productions
- Remove unit productions
- Show each stage of the grammar after every transformation
- Single-page workflow for classroom demonstrations and quick practice

## Tech Stack

- Next.js (App Router)
- TypeScript
- Pure CSS (custom UI design)

## Local Setup (Windows)

1. Install Node.js LTS (already done on your machine in this setup).
2. Install dependencies:

   npm install

3. Start development server:

   npm run dev

4. Open browser:

   http://localhost:3000

## Build and Run

- Production build:

  npm run build

- Start production server:

  npm start

## Deploy on Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Keep defaults (Framework preset: Next.js).
4. Deploy.

No extra server configuration is needed.

## Input Format

Write one production per line:

S -> A B | b
A -> a | ε
B -> C | b
C -> ε | c

Notes:

- Use spaces if you want explicit token separation (A B c).
- You can write epsilon as ε, epsilon, eps, or lambda.
- Start symbol can be specified in the UI.

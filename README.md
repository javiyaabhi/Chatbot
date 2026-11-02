# College Help Chatbot

A small college-help chatbot built with Node.js, Express, and Google Gemini.

## Requirements

- Node.js 18 or newer
- A Google Gemini API key

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open <http://localhost:3000> in a browser.

The API key is loaded only by the server. `.env` and `node_modules` are excluded from Git.

## Development

Run the server with automatic reloads:

```bash
npm run dev
```
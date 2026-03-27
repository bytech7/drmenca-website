# Unify MVP (Messaging + Auto Translation)

This folder contains a full MVP for **Unify**, a mobile-first messaging application.

## Features implemented

- User authentication with email/password + JWT
- Preferred language per user (ex: `en`, `fr`, `es`)
- Real-time chat using Socket.io
- Automatic language detection per message
- Automatic translation into receiver preferred language
- Storage of both original and translated message versions
- REST API + WebSocket architecture
- Basic mobile-first web frontend

## Project structure

```bash
unify-mvp/
  backend/
    src/
      config/
      middleware/
      models/
      routes/
      services/
      sockets/
      server.js
    .env.example
    package.json
  frontend/
    index.html
    styles.css
    script.js
```

## Backend setup

1. Go to backend:

```bash
cd unify-mvp/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` as needed (especially `MONGO_URI`, `JWT_SECRET`, and optional `GOOGLE_TRANSLATE_API_KEY`).

5. Run backend:

```bash
npm run dev
```

Server starts at `http://localhost:5000`.

## Frontend setup

Open a second terminal:

```bash
cd unify-mvp/frontend
python3 -m http.server 5500
```

Then open:

- `http://localhost:5500`

## Required API endpoints

- `POST /register`
- `POST /login`
- `GET /users` (JWT required)
- `POST /messages` (JWT required)
- `GET /messages/:conversationId` (JWT required)

## WebSocket events

- Client emits: `send_message`
- Server emits: `receive_message`

## Message flow logic

When a message is sent:
1. Detect language
2. Fetch receiver preferred language
3. Translate to receiver language
4. Save original + translated text in DB
5. Emit translated message to receiver in real-time

## Translation behavior

- If `GOOGLE_TRANSLATE_API_KEY` is set: attempts Google translation via `google-translate-api-x`
- If key is missing or call fails: uses deterministic mock detection/translation fallback

This keeps local development friction low while preserving the architecture.

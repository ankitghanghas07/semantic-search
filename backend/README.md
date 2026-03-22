# Semantic Search MVP Backend

This is a Node.js backend skeleton using Express, TypeScript, TypeORM (Postgres), BullMQ (Redis), and a placeholder for Milvus (vector DB).

## Features
- Express HTTP API
- TypeORM with Postgres (synchronize: true)
- BullMQ with Redis for background jobs
- Milvus client placeholder
- dotenv for environment configuration

## Project Structure
```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Entry point
│   ├── config/
│   │   ├── database.ts           # PostgreSQL pool
│   │   ├── redis.ts              # Redis connection
│   │   ├── milvus.ts             # Milvus client (placeholder)
│   │   └── index.ts              # Environment config
│   ├── api/
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # Express routes
│   │   ├── middlewares/          # Auth middleware
│   │   └── services/             # Business logic
│   │       ├── embedding.service.ts    # Gemini embeddings
│   │       ├── gemini-chat.service.ts  # Gemini text generation
│   │       ├── search.service.ts       # Semantic search
│   │       ├── chat.service.ts         # RAG chat logic
│   │       └── chunk.service.ts        # Chunk persistence
│   ├── jobs/
│   │   ├── queues/
│   │   │   └── ingestion.queue.ts      # BullMQ queue
│   │   └── workers/
│   │       └── ingestion.worker.ts     # Document processor
│   ├── models/                   # Database models
│   │   ├── User.ts
│   │   ├── Document.ts
│   │   └── Chunk.ts
│   ├── utils/
│   │   ├── cosineSimilarity.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── prompts/
│   │       └── rag.prompt.ts
│   └── types/
│       └── express.d.ts
├── initdb/
│   └── schema.sql               # PostgreSQL schema
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Getting Started

1. Copy `.env.example` to `.env` and adjust as needed.
2. Run `docker-compose up --build` to start all services (backend, Postgres, Redis, Milvus).
3. The backend will be available at http://localhost:3000

## Development
- `npm run dev` — Start in watch mode
- `npm run build` — Compile TypeScript
- `npm start` — Run compiled JS

## Health Check
GET `/health` → `{ "status": "ok" }`

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
  src/
    app.ts               # Express app
    server.ts            # Entry point
    config/
      index.ts           # Load env vars
      database.ts        # TypeORM config (synchronize: true)
      redis.ts           # Redis connection
      milvus.ts          # Placeholder client
    api/
      routes/
        index.ts
        auth.routes.ts
        document.routes.ts
        query.routes.ts
      controllers/
        auth.controller.ts
        document.controller.ts
        query.controller.ts
      middlewares/
        auth.middleware.ts
    jobs/
      queues/
        ingestion.queue.ts
      workers/
        ingestion.worker.ts
    models/
      User.ts
      Document.ts
      Chunk.ts
      Job.ts
    services/
      auth.service.ts
      document.service.ts
      ingestion.service.ts
      query.service.ts
    utils/
      jwt.ts
      password.ts
  tsconfig.json
  package.json
  .env.example
  docker-compose.yml
  Dockerfile
  README.md
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

## Example User Entity
See `src/models/User.ts` for a basic user model.

## Example BullMQ Job
See `src/jobs/queues/ingestion.queue.ts` and `src/jobs/workers/ingestion.worker.ts` for enqueue/consume examples.

---
Replace placeholder code as you build out features.

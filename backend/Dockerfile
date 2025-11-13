# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Start in dev mode with ts-node-dev
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]

# Start in production mode
# CMD ["npm", "run", "start"]

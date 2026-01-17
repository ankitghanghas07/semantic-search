FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Only build when needed (production)
# RUN npm run build

EXPOSE 3000

# Default to dev mode
CMD ["npm", "run", "dev"]
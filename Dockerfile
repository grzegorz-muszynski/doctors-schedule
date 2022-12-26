FROM node:16-alpine
WORKDIR /app
COPY . .
CMD ["node", "app.js"]
FROM node:12-alpine

WORKDIR /app

COPY . .
RUN yarn

EXPOSE 3001

# Start the application
CMD ["node","server.js"]
# CMD ["npm","run", "start:dev"]

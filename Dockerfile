FROM node:12-alpine

WORKDIR /app

COPY . .
RUN yarn
RUN npm install -g .

EXPOSE 8080

# Start Gateway service
# CMD ["pwd"]
CMD ["rgate", "-p 8080", "-c config.yml"]

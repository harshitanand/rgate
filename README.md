#R-GATE
A CLI based api gateway proxy layer, rgate can be run with a command like below to receive traffic on `localhost:8080`

`rgate --port 8080 --config config.yml`

With the contents of config.yml looks like,

```
  routes:
    - path_prefix: /api/payment
      backend: payment
    - path_prefix: /api/orders
      backend: orders

  default_response:
    - body: “This is not reachable”
    - status_code: 403

  backends:
    - name: payment
      match_labels:
        - app_name=payment
        - port=3000
        - env=production
    - name: orders
      match_labels:
        - app_name=orders
        - port=3001
        - env=production
```

## Features

- Each backend is a container.
- A container is selected as a backend if the container has all the match_labels present as Docker labels.
- Incoming http requests are routed to the corresponding backend if the path starts with
  the given path_prefix.
- If there are no routes matching the request, it should respond with the given body and
  status_code in the default_response
- If the backend is down, respond with 503 code
- Accessing http://localhost:8080/stats should give us information about the traffic it
  has received so far.

## Implementation

- Entire `rgate` CLI tool is written in `NodeJS`.
- We have added 2 sample microservices to the coidebase namely `Orders` & `Payment`.
- You can run the setup both on local as well as on docker.
- Basic API proxy layer implemented with minimal overhead.

## Prerequisites

```
Install NodeJs, Yarn & PM2

# this installs nvm on your machine
~$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

~$ nvm install node
~$ npm install -g yarn pm2
```

## Run & Test

```
# Run on local dev envs
~$ yarn start:dev

#Run with docker
~$  yarn docker:start

```

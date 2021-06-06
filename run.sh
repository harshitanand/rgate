# npm install -g pm2

yarn docker:kill
pm2 delete all
# Run Orders Microservice
cd orders && yarn && pm2 --name Orders start server.js -f

# Run Payment Microservice
cd ../payment && yarn && pm2 --name Payment start server.js -f

# Install rgate CLI & run proxy
cd ../ && yarn local:install

rgate -p 8080 -c config-dev.yml

#!/usr/bin/env node

'use strict';

const fs = require('fs');
const jsYaml = require('js-yaml');
const commander = require('commander');
const server = require('./server');

const configParser = async (path) => {
  const doc = await jsYaml.load(fs.readFileSync(path, 'utf8'));
  if (!doc.routes || !doc.backends) return Promise.reject(new Error('Routes or Backends config not found'));

  const proxies = [];
  doc.routes.map((route) => {
    if (!route.path_prefix || !route.backend) {
      console.error('route prefix or app backend missing');
      process.exit(1);
    }

    doc.backends.map((back) => {
      if (back.name && back.name === route.backend) {
        if (!back.match_labels) {
          console.error('backend labels are missing');
          process.exit(1);
        }
        let error = true;
        const target = {};
        back.match_labels.map((label) => {
          if (typeof label === 'string' && label.startsWith('app_name')) {
            target.host = `http://${label.split('=')[1]}`;
            error = false;
          }
          if (typeof label === 'string' && label.startsWith('port')) {
            target.port = `${label.split('=')[1]}`;
            error = false;
          }
          return label;
        });

        if (error || !target.host || !target.port) {
          console.error('App Host or Port config is missing');
          process.exit(1);
        }

        proxies.push({ route: route.path_prefix, target: `${target.host}:${target.port}` });
      }
      return back;
    });
    return route;
  });

  const defaultRes = {};
  doc.default_response.map((item) => {
    if (item.body) defaultRes.message = item.body || 'Not Found';
    else if (item.status_code) defaultRes.status = item.status_code || '403';
    return item;
  });

  return { proxies, defaultRes };
};

const main = async () => {
  const program = new commander.Command();
  program.usage('[command] [flags]');

  program.option('-v, --version <value>', 'app version');
  program.option('-p, --port <number>', 'port specification to run API gateway');
  program.option('-c, --config <filePath>', 'configuration file path');

  program.parse();
  const options = program.opts();
  if (options.port.trim() && fs.existsSync(options.config.trim())) {
    console.log('API Gateway starting at port ', options.port);
    const { proxies, defaultRes } = await configParser(options.config.trim()).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
    console.log(proxies);
    server.init(options.port.trim(), proxies, defaultRes);
  } else console.log('Config file does not exists!! ', options);
};

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});

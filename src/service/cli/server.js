'use strict';

const chalk = require(`chalk`);
const express = require(`express`);
const routes = require(`../api`);
const {HttpCode, ExitCode, API_PREFIX} = require(`../../const`);

const DEFAULT_PORT = 3000;

const PortRestrict = {
  MIN: 0,
  MAX: 65536,
};

const app = express();
app.use(express.json());

module.exports = {
  name: `--server`,
  async run(args) {

    const [customPort] = args;

    const portNumber = Number.parseInt(customPort, 10) || DEFAULT_PORT;
    const port = portNumber >= PortRestrict.MIN && portNumber < PortRestrict.MAX ? portNumber : DEFAULT_PORT;

    try {
      const router = await routes();
      app.use(API_PREFIX, router);
      app.use((req, res) => res.status(HttpCode.NOT_FOUND).send(`Not found`));

      app.listen(port, (err) => {
        if (err) {
          console.error(chalk.red(`Ошибка при создании сервера`), err);
          process.exit(ExitCode.error);
        }
        return console.info(chalk.green(`Ожидаю соединений на ${port}`));
      });

    } catch (err) {
      console.error(chalk.red(`Произошла ошибка: ${err.message}`));
      process.exit(ExitCode.error);
    }
  }
};

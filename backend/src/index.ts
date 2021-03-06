import 'dotenv/config'; // Load .env files

import 'reflect-metadata'; // needed to get tsyringe dependency injection going
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Routes } from './controllers/routes';
import cors from 'cors';
import { ControllerError } from './controllers/errors';
import { DataValidationError, hasProperty } from 'common/dist';
import { TokenDecodeError } from './types/errors/TokenDecodeError';
import DatabaseController from './models';
import { init as i18nextInit } from './utils/i18n';
import * as http from 'http';
import { Settings as LuxonSettings, DateTime } from 'luxon';
import { initMailTransporter } from './mail/MailTransporter';
import { container } from 'tsyringe';
import helmet from 'helmet';
import schedule_clear_outdated_bookings from './task_scheduling/schedule_clear_outdated_bookings';
import { DemoDataGenerator } from './utils/DemoDataGenerator';

const { DEV_MODE, DEBUG_TIME_NOW } = process.env;

const port = process.env.PORT || 3000;

async function runServer() {
  const app = express();

  // secure HTTP headers
  app.use(helmet());

  // Allow AJAX requests to skip same-origin policy
  app.use(cors());

  // parse json requests
  app.use(bodyParser.json());

  app.use(cookieParser());

  const routes = container.resolve(Routes);
  routes.routes(app);

  // custom error handler
  // https://expressjs.com/en/guide/error-handling.html
  app.use(
    (
      err: unknown,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (typeof err === 'object' && err != null && hasProperty(err, 'stack')) {
        console.error(err.stack);
      }
      console.error(`Encountered error: ${JSON.stringify(err)}`);

      if (res.headersSent) {
        return next(err);
      } else if (err instanceof ControllerError) {
        res.status(err.errorCode == null ? 500 : err.errorCode);
        res.json(err.message);
      } else if (err instanceof DataValidationError) {
        res.status(400);
        res.json(err.message);
      } else if (err instanceof TokenDecodeError) {
        res.status(401);
        res.json(err.message);
      } else {
        console.error('Unknown error! Forwarding to default error handler...');
        return next(err);
      }
    }
  );

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);

    if (DEV_MODE === '1') {
      console.warn(
        '\nApplication runs in development mode! (Environment variable DEV_MODE is set to 1)\nNever use this mode in production.\n'
      );
    }
  });
}

async function genDemoData() {
  const generator = container.resolve(DemoDataGenerator);

  await generator.genDemoData();

  console.log('Generated demo data.');
  process.exit(0);
}

async function init() {
  if (DEBUG_TIME_NOW != null) {
    LuxonSettings.now = () => DateTime.fromISO(DEBUG_TIME_NOW).toMillis();
  }

  initMailTransporter();

  // setup i18n translations
  await i18nextInit();

  // setup database
  const db = container.resolve(DatabaseController);
  await db.init();

  schedule_clear_outdated_bookings();

  if (process.argv.length > 2) {
    if (process.argv[2] == 'gen-demo-data') {
      await genDemoData();
    } else {
      console.error(`Unknown command: ${process.argv[2]}`);
    }
  } else {
    await runServer();
  }
}

// noinspection JSIgnoredPromiseFromCall
init();

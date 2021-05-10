import express from 'express';
import * as https from 'https';
import * as fs from 'fs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Routes } from './config/routes';
import cors from 'cors';
import { ControllerError } from './controllers/errors';
import { DataValidationError, hasProperty } from 'common/dist';
import { TokenDecodeError } from './types/errors/TokenDecodeError';
import DatabaseController from './models';

const { SSL_CRT_FILE, SSL_KEY_FILE } = process.env;

const port = process.env.PORT || 3000;

async function init() {
  const db = new DatabaseController();

  await db.init();

  const app = express();

  // Allow AJAX requests to skip same-origin policy
  app.use(cors());

  // parse json requests
  app.use(bodyParser.json());

  app.use(cookieParser());

  const routes = new Routes(db);
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

  const server = https.createServer(
    {
      key: fs.readFileSync(
        SSL_KEY_FILE || '../dev-certificate/generated/server.key'
      ),
      cert: fs.readFileSync(
        SSL_CRT_FILE || '../dev-certificate/generated/server.crt'
      ),
    },
    app
  );

  server.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
  });
}

// noinspection JSIgnoredPromiseFromCall
init();

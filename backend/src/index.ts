import express from 'express';
import bodyParser from 'body-parser';
import { Routes } from './config/routes';
import cors from 'cors';
import db from './models';
import { ControllerError } from './controllers/errors';
import { DataValidationError } from 'common/dist';
import { TokenDecodeError } from './types/errors/TokenDecodeError';
import { DataIdAlreadyExists } from './repositories/errors';

db.init();

const app = express();
const port = 3000;

// Allow AJAX requests to skip same-origin policy
app.use(cors());

// parse json requests
app.use(bodyParser.json());

// custom error handler
// https://expressjs.com/en/guide/error-handling.html
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);

    if (res.headersSent) {
      return next(err);
    } else if (err instanceof ControllerError) {
      res.status(err.errorCode == null ? 500 : err.errorCode);
      res.render('error', { error: err.message });
    } else if (err instanceof DataValidationError) {
      res.status(400);
      res.render(err.message);
    } else if (err instanceof TokenDecodeError) {
      res.status(401);
      res.render(err.message);
    } else {
      console.error('Unknown error! Forwarding to default error handler...');
      return next(err);
    }
  }
);

const routes = new Routes();
routes.routes(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

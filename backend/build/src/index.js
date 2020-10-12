"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = require("./config/routes");
const cors_1 = __importDefault(require("cors"));
const models_1 = __importDefault(require("./models"));
const errors_1 = require("./controllers/errors");
const dist_1 = require("common/dist");
models_1.default.init();
const app = express_1.default();
const port = 3000;
// Allow AJAX requests to skip same-origin policy
app.use(cors_1.default());
// parse json requests
app.use(body_parser_1.default.json());
// custom error handler
// https://expressjs.com/en/guide/error-handling.html
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }
    else if (err instanceof errors_1.ControllerError) {
        res.status(err.errorCode == null ? 500 : err.errorCode);
        res.render('error', { error: err.message });
    }
    else if (err instanceof dist_1.DataValidationError) {
        res.status(500);
        res.render(err.message);
    }
    else {
        console.error('Unknown error! Forwarding to default error handler...');
        return next(err);
    }
});
const routes = new routes_1.Routes();
routes.routes(app);
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

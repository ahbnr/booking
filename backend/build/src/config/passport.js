"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthHandler = exports.authHandler = exports.initializedPassport = exports.jwtSecret = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const user_model_1 = require("../models/user.model");
// FIXME: Load proper secret from somewhere else
exports.jwtSecret = 'secret';
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
};
passport_1.default.use(new passport_jwt_1.Strategy(opts, (jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByPk(jwtPayload.username);
        if (user != null) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    }
    catch (e) {
        done(e, false);
    }
})));
exports.initializedPassport = passport_1.default;
exports.authHandler = exports.initializedPassport.authenticate('jwt', {
    session: false,
});
function optionalAuthHandler(req, res, next) {
    exports.initializedPassport.authenticate('jwt', {
        session: false,
    }, (err, user, _) => {
        req.authenticated = user != null;
        next();
    })(req, res, next);
}
exports.optionalAuthHandler = optionalAuthHandler;

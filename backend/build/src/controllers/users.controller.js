"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const user_model_1 = require("../models/user.model");
const passport_1 = require("../config/passport");
//import password from 'secure-random-password';
const autobind_decorator_1 = require("autobind-decorator");
const email_1 = require("../utils/email");
const jwt_1 = require("../utils/jwt");
const dist_1 = require("common/dist");
const SignupTokenData_1 = require("../types/token-types/SignupTokenData");
const common_1 = require("common");
let UsersController = UsersController_1 = class UsersController {
    static initRootUser() {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield user_model_1.User.findByPk('root')) == null) {
                //const generatedPassword = password.randomPassword();
                const generatedPassword = 'root';
                yield user_model_1.User.create({
                    name: 'root',
                    password: generatedPassword,
                });
                console.log(`\n\nCreated "root" user with password ${generatedPassword}. Remember this password and erase this log!\n\n`);
            }
        });
    }
    static makeSignupToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                type: 'SignupToken',
                email: email,
            };
            return yield jwt_1.asyncJwtSign(data, passport_1.jwtSecret, {});
        });
    }
    static sendSignupMail(targetUrl, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const signupToken = yield UsersController_1.makeSignupToken(email);
            yield email_1.sendMail(email, 'Signup', '', // TODO text represenation
            `<a href="${targetUrl}?token=${signupToken}">Signup</a>`);
        });
    }
    inviteForSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const invitationData = dist_1.checkType(req.body, dist_1.InviteForSignupData);
            yield UsersController_1.sendSignupMail(invitationData.targetUrl, invitationData.email);
            res.status(200).json({});
        });
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = dist_1.checkType(req.body, common_1.SignupRequestData);
            const email = yield UsersController_1.decodeSignupToken(data.signupToken);
            const user = yield user_model_1.User.create(Object.assign(Object.assign({}, data.userData), { email: email }));
            const authToken = yield UsersController_1.getAuthToken(user);
            res.json(authToken);
        });
    }
    static getAuthToken(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = dist_1.noRefinementChecks({
                type: 'AuthTokenData',
                username: user.name,
            });
            return yield jwt_1.asyncJwtSign(data, passport_1.jwtSecret, {});
        });
    }
    isSignupTokenOk(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signupToken = req.body.token;
                yield UsersController_1.decodeSignupToken(signupToken);
                res.json(true);
            }
            catch (e) {
                res.json(false);
            }
        });
    }
    static decodeSignupToken(signupToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof signupToken === 'string') {
                // eslint-disable-next-line @typescript-eslint/ban-types
                const decodedToken = yield jwt_1.asyncJwtVerify(signupToken, passport_1.jwtSecret, {});
                return dist_1.checkType(decodedToken, SignupTokenData_1.SignupTokenData);
            }
            throw new Error('Could not decode token,');
        });
    }
    auth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const authData = dist_1.checkType(req.body, common_1.AuthRequestData);
            const user = yield user_model_1.User.findByPk(authData.username);
            if (user != null) {
                if (yield (user === null || user === void 0 ? void 0 : user.doesPasswordMatch(authData.password))) {
                    const token = yield UsersController_1.getAuthToken(user);
                    res.status(200).json(token);
                }
                else {
                    res.status(401).json({ message: 'Wrong password.' });
                }
            }
            else {
                res.status(401).json({ message: 'User not found.' });
            }
        });
    }
};
UsersController = UsersController_1 = __decorate([
    autobind_decorator_1.boundClass
], UsersController);
exports.UsersController = UsersController;

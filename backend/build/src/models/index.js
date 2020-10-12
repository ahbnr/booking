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
const db_config_1 = __importDefault(require("../config/db.config"));
const sequelize_typescript_1 = require("sequelize-typescript");
const users_controller_1 = require("../controllers/users.controller");
const sequelize = new sequelize_typescript_1.Sequelize(db_config_1.default.db, db_config_1.default.user, db_config_1.default.password, db_config_1.default.sequelize_options);
const db = {
    sequelize: sequelize,
    init: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield sequelize.sync();
            yield users_controller_1.UsersController.initRootUser();
            console.log('Synced DB.');
        }
        catch (error) {
            console.error(error);
        }
    }),
};
exports.default = db;

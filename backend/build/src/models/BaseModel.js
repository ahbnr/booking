"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
class BaseModel extends sequelize_typescript_1.Model {
    /**
     * Get object representation which can be turned into JSON.
     * Same as `toJSON` but typed.
     *
     * Based on https://github.com/RobinBuschmann/sequelize-typescript/issues/617#issuecomment-491873054
     */
    toTypedJSON() {
        return super.toJSON();
    }
}
exports.BaseModel = BaseModel;

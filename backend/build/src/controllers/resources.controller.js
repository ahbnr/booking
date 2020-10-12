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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var ResourcesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesController = void 0;
const weekday_model_1 = require("../models/weekday.model");
const errors_1 = require("./errors");
const autobind_decorator_1 = require("autobind-decorator");
const resource_model_1 = require("../models/resource.model");
const dist_1 = require("common/dist");
let ResourcesController = ResourcesController_1 = class ResourcesController {
    static resourceAsGetInterface(resource) {
        const _a = resource.toTypedJSON(), { weekdays } = _a, strippedResource = __rest(_a, ["weekdays"]);
        // no refinement checks, we assume the database records are correct at least regarding refinements
        return dist_1.noRefinementChecks(Object.assign(Object.assign({}, strippedResource), { weekdayIds: (weekdays === null || weekdays === void 0 ? void 0 : weekdays.map((weekday) => weekday.id)) || [] }));
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resources = yield resource_model_1.Resource.findAll({ include: [{ all: true }] });
            res.json(resources.map(ResourcesController_1.resourceAsGetInterface));
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceName = ResourcesController_1.retrieveResourceName(req);
            const resourceData = dist_1.checkType(req.body, dist_1.ResourcePostInterface);
            if (resourceData != null) {
                try {
                    const resource = yield resource_model_1.Resource.create(Object.assign(Object.assign({}, resourceData), { name: resourceName }));
                    res
                        .status(201)
                        .json(ResourcesController_1.resourceAsGetInterface(resource));
                }
                catch (error) {
                    res.status(500).json(error);
                }
            }
        });
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = yield this.getResource(req);
            res.json(ResourcesController_1.resourceAsGetInterface(resource));
        });
    }
    createWeekday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = yield this.getResource(req);
            const weekdayData = dist_1.checkType(req.body, dist_1.WeekdayPostInterface);
            if (weekdayData != null) {
                try {
                    const weekday = yield weekday_model_1.Weekday.create(Object.assign({ resourceName: resource.name }, weekdayData));
                    res.status(201).json(weekday);
                }
                catch (error) {
                    res.status(500).json(error);
                }
            }
        });
    }
    getWeekdays(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = yield this.getResource(req);
            const weekdays = resource === null || resource === void 0 ? void 0 : resource.weekdays;
            if (weekdays != null) {
                res.json(weekdays);
            }
            else {
                res.json([]);
            }
        });
    }
    // noinspection JSMethodCanBeStatic
    getResource(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceName = ResourcesController_1.retrieveResourceName(req);
            const resource = yield resource_model_1.Resource.findByPk(resourceName, {
                include: [{ all: true }],
            });
            if (resource != null) {
                return resource;
            }
            else {
                throw new errors_1.ControllerError('Resource not found', 404);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceName = ResourcesController_1.retrieveResourceName(req);
            if (resourceName != null) {
                const resourceData = dist_1.checkType(req.body, dist_1.ResourcePostInterface);
                if (resourceData != null) {
                    const update = {
                        where: { name: resourceName },
                        limit: 1,
                    };
                    try {
                        yield resource_model_1.Resource.update(resourceData, update);
                        res.status(202).json({ data: 'success' });
                    }
                    catch (error) {
                        res.status(500).json(error);
                    }
                }
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceName = ResourcesController_1.retrieveResourceName(req);
            const options = {
                where: { name: resourceName },
                limit: 1,
            };
            try {
                yield resource_model_1.Resource.destroy(options);
                res.status(204).json({ data: 'success' });
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
    }
    static retrieveResourceName(req) {
        return dist_1.checkType(req.params.name, dist_1.NonEmptyString);
    }
};
ResourcesController = ResourcesController_1 = __decorate([
    autobind_decorator_1.boundClass
], ResourcesController);
exports.ResourcesController = ResourcesController;

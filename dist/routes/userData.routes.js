"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userData.routes.ts
const express_1 = __importDefault(require("express"));
const userData_controller_1 = require("../controller/userData.controller");
const router = express_1.default.Router();
// Endpoint untuk mengambil data pengguna
router.get('/user-data', userData_controller_1.getUserData);
// Endpoint untuk memperbarui data pengguna
router.put('/user-data', userData_controller_1.updateUserData);
exports.default = router;

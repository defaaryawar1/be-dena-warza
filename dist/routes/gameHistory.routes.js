"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/gameHistory.routes.ts
const express_1 = __importDefault(require("express"));
const gameHistory_controller_1 = require("../controller/gameHistory.controller");
const router = express_1.default.Router();
// Endpoint untuk menyimpan riwayat game
router.post('/', gameHistory_controller_1.saveGameHistory);
exports.default = router;

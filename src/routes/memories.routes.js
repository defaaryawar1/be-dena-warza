"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const memories_controller_1 = require("../controller/memories.controller");
const router = express_1.default.Router();
router.get('/', (req, res, next) => {
    (0, memories_controller_1.getAllMemories)(req, res).catch(next);
});
router.post('/', (req, res, next) => {
    (0, memories_controller_1.createMemory)(req, res).catch(next);
});
router.get('/:id', (req, res, next) => {
    (0, memories_controller_1.getSingleMemory)(req, res).catch(next);
});
router.put('/:id', (req, res, next) => {
    (0, memories_controller_1.updateMemory)(req, res).catch(next);
});
router.delete('/:id', (req, res, next) => {
    (0, memories_controller_1.deleteMemory)(req, res).catch(next);
});
exports.default = router;

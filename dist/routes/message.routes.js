"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("../controller/message.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Debug: Log saat rute dipanggil
router.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});
// Apply authentication middleware
router.use(auth_middleware_1.authenticateToken);
// Route untuk mengirim pesan WhatsApp
router.post('/send', message_controller_1.sendWhatsAppMessage);
exports.default = router;

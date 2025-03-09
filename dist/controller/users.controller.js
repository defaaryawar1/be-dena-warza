"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Mock data untuk PIN dan secret token
const CORRECT_PIN = process.env.CORRECT_PIN_SAYA;
const SECRET_TOKEN = process.env.SECRET_TOKEN_SAYA;
if (!SECRET_TOKEN) {
    throw new Error("SECRET_TOKEN_SAYA is not defined in environment variables");
}
const authenticatePin = (req, res) => {
    const { pin } = req.body;
    if (!pin) {
        res.status(400).json({ error: 'PIN is required' });
        return;
    }
    if (pin === CORRECT_PIN) {
        // Buat token JWT
        const token = jsonwebtoken_1.default.sign({ authenticated: true }, SECRET_TOKEN, { expiresIn: '1h' });
        // Kirim token ke client
        res.status(200).json({ success: true, token });
    }
    else {
        res.status(401).json({ error: 'Incorrect PIN' });
    }
};
exports.authenticatePin = authenticatePin;

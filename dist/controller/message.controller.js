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
exports.sendWhatsAppMessage = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
const sendWhatsAppMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    // Debug: Log request body
    console.log("Request body:", req.body);
    // Validasi input
    if (!message) {
        console.error("Pesan tidak boleh kosong");
        res.status(400).json({ error: 'Pesan tidak boleh kosong' });
        return;
    }
    try {
        // Debug: Log Twilio credentials
        console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
        console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "***" : "Tidak ditemukan");
        // Kirim pesan menggunakan Twilio
        const response = yield client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886', // Nomor WhatsApp Twilio
            to: 'whatsapp:+6281219147116' // Nomor WhatsApp Defano
        });
        // Debug: Log response dari Twilio
        console.log("Twilio response:", response);
        // Berhasil mengirim pesan
        res.status(200).json({ success: true, message: "Pesan terkirim!", response });
    }
    catch (error) {
        console.error('Gagal mengirim pesan:', error);
        // Tangani error dan kembalikan respons yang sesuai
        res.status(500).json({ success: false, message: "Gagal mengirim pesan", error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak terduga' });
    }
});
exports.sendWhatsAppMessage = sendWhatsAppMessage;

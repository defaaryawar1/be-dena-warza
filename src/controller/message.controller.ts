import { Request, Response } from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendWhatsAppMessage = async (req: Request, res: Response): Promise<void> => {
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
        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886', // Nomor WhatsApp Twilio
            to: 'whatsapp:+6281219147116' // Nomor WhatsApp Defano
        });

        // Debug: Log response dari Twilio
        console.log("Twilio response:", response);

        // Berhasil mengirim pesan
        res.status(200).json({ success: true, message: "Pesan terkirim!", response });
    } catch (error) {
        console.error('Gagal mengirim pesan:', error);

        // Tangani error dan kembalikan respons yang sesuai
        res.status(500).json({ success: false, message: "Gagal mengirim pesan", error: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak terduga' });
    }
};
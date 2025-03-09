import express from 'express';
import { sendWhatsAppMessage } from '../controller/message.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Debug: Log saat rute dipanggil
router.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Apply authentication middleware
router.use(authenticateToken);

// Route untuk mengirim pesan WhatsApp
router.post('/send', sendWhatsAppMessage);

export default router;
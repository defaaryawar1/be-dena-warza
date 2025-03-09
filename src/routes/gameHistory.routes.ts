// src/routes/gameHistory.routes.ts
import express from 'express';
import { saveGameHistory } from '../controller/gameHistory.controller';

const router = express.Router();

// Endpoint untuk menyimpan riwayat game
router.post('/', saveGameHistory);

export default router;

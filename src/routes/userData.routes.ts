// src/routes/userData.routes.ts
import express from 'express';
import { getUserData, updateUserData } from '../controller/userData.controller';

const router = express.Router();

// Endpoint untuk mengambil data pengguna
router.get('/user-data', getUserData);

// Endpoint untuk memperbarui data pengguna
router.put('/user-data', updateUserData);

export default router;
// src/controllers/gameHistory.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; // Impor PrismaClient langsung

const prisma = new PrismaClient(); // Inisialisasi PrismaClient

// Fungsi untuk menyimpan riwayat game
export const saveGameHistory = async (req: Request, res: Response): Promise<void> => {
    console.log('=== START: saveGameHistory ==='); // Log awal fungsi

    try {
        // Log request body
        console.log('Request Body:', req.body);

        const { userId, activity, details } = req.body;

        // Validasi input
        if (!userId || !activity || !details) {
            console.error('Validation Error: userId, activity, atau details tidak ditemukan');
            res.status(400).json({ error: 'userId, activity, dan details diperlukan' });
            return;
        }

        // Log sebelum menyimpan ke database
        console.log('Menyimpan riwayat game ke database...');

        // Simpan riwayat game ke database menggunakan Promise
        const gameHistory = await prisma.gameHistory.create({
            data: {
                userId,
                activity,
                details,
            },
        });

        // Log data yang disimpan
        console.log('Game History Saved:', gameHistory);

        // Kirim respons sukses
        res.status(201).json({
            message: 'Riwayat game berhasil disimpan',
            data: gameHistory,
        });
    } catch (error) {
        // Log error
        console.error('Error menyimpan riwayat game:', error);

        // Kirim respons error
        res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan riwayat game' });
    } finally {
        console.log('=== END: saveGameHistory ==='); // Log akhir fungsi
    }
};

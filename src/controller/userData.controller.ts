// src/controller/userData.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi untuk mengambil data pengguna
export const getUserData = async (req: Request, res: Response): Promise<void> => {
    console.log('=== START: getUserData ==='); // Log awal fungsi

    try {
        // Log request query
        console.log('Request Query:', req.query);

        const { user } = req.query; // Ambil query parameter `user`

        // Log query parameter `user`
        console.log('Query Parameter "user":', user);

        // Validasi input
        if (!user || (user !== 'defano' && user !== 'najmita')) {
            console.error('Validation Error: User tidak valid. Pilih antara "defano" atau "najmita".');
            res.status(400).json({ error: 'User tidak valid. Pilih antara "defano" atau "najmita".' });
            return;
        }

        // Log sebelum query database
        console.log('Mengambil data pengguna dari database...');

        // Ambil data pengguna dari database
        const userData = await prisma.user.findUnique({
            where: {
                id: user as string, // Gunakan `user` sebagai ID
            },
            select: {
                id: true,
                name: true,
                level: true,
                experience: true,
                nextLevel: true,
                totalScore: true,
                streakCount: true,
                achievements: true,
            },
        });

        // Log data yang diambil dari database
        console.log('Data Pengguna dari Database:', userData);

        // Jika pengguna tidak ditemukan
        if (!userData) {
            console.error('Error: Pengguna tidak ditemukan');
            res.status(404).json({ error: 'Pengguna tidak ditemukan' });
            return;
        }

        // Log sebelum mengirim respons
        console.log('Mengirim respons sukses...');

        // Kirim respons sukses
        res.status(200).json(userData);
    } catch (error) {
        // Log error
        console.error('Error saat mengambil data pengguna:', error);

        // Kirim respons error
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna' });
    } finally {
        console.log('=== END: getUserData ==='); // Log akhir fungsi
    }
};

// Fungsi untuk memperbarui data pengguna
export const updateUserData = async (req: Request, res: Response): Promise<void> => {
    console.log('=== START: updateUserData ===');

    try {
        console.log('Request Body:', req.body);

        const { id, name, level, experience, nextLevel, totalScore, streakCount, achievements } = req.body;

        // Validasi input
        if (!id) { // Perbaiki validasi untuk memeriksa `id` bukan `userId`
            console.error('Validation Error: id diperlukan');
            res.status(400).json({ error: 'id diperlukan' });
            return;
        }

        console.log('Memperbarui data pengguna di database...');

        const updatedUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                name,
                level,
                experience,
                nextLevel,
                totalScore,
                streakCount,
                achievements,
            },
        });

        console.log('Data Pengguna Diperbarui:', updatedUser);

        res.status(200).json({
            message: 'Data pengguna berhasil diperbarui',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error memperbarui data pengguna:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data pengguna' });
    } finally {
        console.log('=== END: updateUserData ===');
    }
};
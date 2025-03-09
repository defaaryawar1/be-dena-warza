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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGameHistory = void 0;
const client_1 = require("@prisma/client"); // Impor PrismaClient langsung
const prisma = new client_1.PrismaClient(); // Inisialisasi PrismaClient
// Fungsi untuk menyimpan riwayat game
const saveGameHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const gameHistory = yield prisma.gameHistory.create({
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
    }
    catch (error) {
        // Log error
        console.error('Error menyimpan riwayat game:', error);
        // Kirim respons error
        res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan riwayat game' });
    }
    finally {
        console.log('=== END: saveGameHistory ==='); // Log akhir fungsi
    }
});
exports.saveGameHistory = saveGameHistory;

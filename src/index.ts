// src/index.ts
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import express from 'express';
import cors from 'cors';
import memoriesRoutes from './routes/memories.routes';
import usersRoutes from './routes/users.routes';
import messageRoutes from './routes/message.routes';
import gameHistoryRoutes from './routes/gameHistory.routes';
import userDataRoutes from './routes/userData.routes'; // Import rute user-data

const app = express();

const corsOptions = {
    origin: [
        'https://dena-warza.vercel.app',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle file uploads
app.use('/uploads', express.static('uploads'));

// Mount memories routes
app.use('/api/memories', memoriesRoutes);

// Mount users routes
app.use('/api/users', usersRoutes);

// Mount message routes
app.use('/api/messages', messageRoutes);

// Mount game history routes
app.use('/api/game-history', gameHistoryRoutes);

// Mount user-data routes
app.use('/api', userDataRoutes); // Tambahkan rute user-data

// Debug: Log saat server berjalan
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan yang tidak terduga' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

export default app;
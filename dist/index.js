"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const memories_routes_1 = __importDefault(require("./routes/memories.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const gameHistory_routes_1 = __importDefault(require("./routes/gameHistory.routes"));
const userData_routes_1 = __importDefault(require("./routes/userData.routes")); // Import rute user-data
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Handle file uploads
app.use('/uploads', express_1.default.static('uploads'));
// Mount memories routes
app.use('/api/memories', memories_routes_1.default);
// Mount users routes
app.use('/api/users', users_routes_1.default);
// Mount message routes
app.use('/api/messages', message_routes_1.default);
// Mount game history routes
app.use('/api/game-history', gameHistory_routes_1.default);
// Mount user-data routes
app.use('/api', userData_routes_1.default); // Tambahkan rute user-data
// Debug: Log saat server berjalan
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan yang tidak terduga' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
exports.default = app;

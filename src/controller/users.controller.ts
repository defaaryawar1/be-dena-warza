// users.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Mock data untuk PIN dan secret token
const CORRECT_PIN = process.env.CORRECT_PIN_SAYA;
const SECRET_TOKEN = process.env.SECRET_TOKEN_SAYA; 

if (!SECRET_TOKEN) {
    throw new Error("SECRET_TOKEN_SAYA is not defined in environment variables");
}

export const authenticatePin = (req: Request, res: Response) => {
    const { pin } = req.body;
    
    if (!pin) {
        res.status(400).json({ error: 'PIN is required' });
        return;
    }
    
    if (pin === CORRECT_PIN) {
        // Buat token JWT
        const token = jwt.sign({ authenticated: true }, SECRET_TOKEN, { expiresIn: '1h' });
        
        // Kirim token ke client
        res.status(200).json({ success: true, token });
    } else {
        res.status(401).json({ error: 'Incorrect PIN' });
    }
}; 
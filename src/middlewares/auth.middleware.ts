import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'; // Impor error types
import dotenv from 'dotenv';

dotenv.config();

const SECRET_TOKEN = process.env.SECRET_TOKEN_SAYA;
if (!SECRET_TOKEN) {
    throw new Error("SECRET_TOKEN_SAYA is not defined in environment variables");
}

// Define the JWT payload structure
interface JwtPayload {
    id: string;
    username: string;
}

// Extend Express Request to include the user property
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

// Define middleware function with correct return type
export const authenticateToken = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ 
            success: false,
            message: 'Token tidak ditemukan',
            error: 'Unauthorized access'
        });
        return;
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_TOKEN) as JwtPayload;
        
        // Add user info to request object
        (req as AuthenticatedRequest).user = decoded;
        
        next();
    } catch (err) {
        // Handle specific JWT errors
        if (err instanceof TokenExpiredError) { // Gunakan TokenExpiredError yang diimpor
            res.status(401).json({
                success: false,
                message: 'Token telah kadaluarsa',
                error: 'Token expired'
            });
        } else if (err instanceof JsonWebTokenError) { // Gunakan JsonWebTokenError yang diimpor
            res.status(403).json({
                success: false,
                message: 'Token tidak valid',
                error: 'Invalid token'
            });
        } else {
            // Handle other errors
            res.status(403).json({
                success: false,
                message: 'Token tidak valid atau telah kadaluarsa',
                error: 'Authentication failed'
            });
        }
        // No return value needed
    }
};
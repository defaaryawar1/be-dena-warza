"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken")); // Impor error types
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_TOKEN = process.env.SECRET_TOKEN_SAYA;
if (!SECRET_TOKEN) {
    throw new Error("SECRET_TOKEN_SAYA is not defined in environment variables");
}
// Define middleware function with correct return type
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
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
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_TOKEN);
        // Add user info to request object
        req.user = decoded;
        next();
    }
    catch (err) {
        // Handle specific JWT errors
        if (err instanceof jsonwebtoken_1.TokenExpiredError) { // Gunakan TokenExpiredError yang diimpor
            res.status(401).json({
                success: false,
                message: 'Token telah kadaluarsa',
                error: 'Token expired'
            });
        }
        else if (err instanceof jsonwebtoken_1.JsonWebTokenError) { // Gunakan JsonWebTokenError yang diimpor
            res.status(403).json({
                success: false,
                message: 'Token tidak valid',
                error: 'Invalid token'
            });
        }
        else {
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
exports.authenticateToken = authenticateToken;

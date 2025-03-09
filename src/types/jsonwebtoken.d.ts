declare module 'jsonwebtoken' {
    export class TokenExpiredError extends Error {
        name: 'TokenExpiredError';
        expiredAt: Date;
    }

    export class JsonWebTokenError extends Error {
        name: 'JsonWebTokenError';
    }

    export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: any): string;
    export function verify(token: string, secretOrPublicKey: string, options?: any): any;
    export function decode(token: string, options?: any): null | { [key: string]: any };
} 
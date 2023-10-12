import crypto from 'crypto';

export const config = {
    appName: 'Kitsas Addon',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    PORT: process.env.PORT || 3000,
    SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomUUID(),
}
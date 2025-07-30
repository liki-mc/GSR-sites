import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
    earlyAccess: true,
    schema: path.join('models', 'schema.prisma'),
});
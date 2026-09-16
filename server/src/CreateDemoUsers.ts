import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("Generating demo users...");
    const plainTextPassword = "password123";
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
    const demoAccounts = [
        { email: 'admin@synapse.com', role: 'admin' },
        { email: 'student@synapse.com', role: 'student' }
    ];

    for (const account of demoAccounts) {
        const user = await prisma.user.upsert({
            where: { email: account.email },
            update: { password_hash: hashedPassword, role: account.role },
            create: {
                email: account.email,
                password_hash: hashedPassword,
                role: account.role
            }
        });
        console.log(`| ${user.email.padEnd(21)} | ${plainTextPassword.padEnd(11)} | ${user.role.padEnd(8)} |`);
    }
}

main()
    .catch((e) => {
        console.error("Error generating demo users:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
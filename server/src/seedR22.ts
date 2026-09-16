import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Synapse Database...");

    const plainTextPassword = "password123";
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
    const demoAccounts = [
        { email: 'admin@synapse.com', role: 'admin' },
        { email: 'student@synapse.com', role: 'student' }
    ];

    for (const account of demoAccounts) {
        await prisma.user.upsert({
            where: { email: account.email },
            update: { password_hash: hashedPassword, role: account.role },
            create: {
                email: account.email,
                password_hash: hashedPassword,
                role: account.role
            }
        });
    }
    console.log("Demo accounts initialized: admin@synapse.com, student@synapse.com");

    let r22 = await prisma.regulation.findFirst({
        where: { name: 'R22' }
    });
    if (!r22) {
        r22 = await prisma.regulation.create({
            data: { name: 'R22' }
        });
    }
    console.log(`Regulation: ${r22.name} (id: ${r22.id})`);

    let cse = await prisma.branch.findFirst({
        where: { name: 'CSE', regulationId: r22.id }
    });
    if (!cse) {
        cse = await prisma.branch.create({
            data: { name: 'CSE', regulationId: r22.id }
        });
    }
    console.log(`Branch: ${cse.name} (id: ${cse.id})`);

    const sampleSubjects = [
        { name: 'Data Structures', year: 2, semester: 1 },
        { name: 'Computer Organization & Architecture', year: 2, semester: 1 },
        { name: 'Operating Systems', year: 2, semester: 2 },
        { name: 'Database Management Systems', year: 2, semester: 2 },
        { name: 'Computer Networks', year: 3, semester: 1 },
        { name: 'Design & Analysis of Algorithms', year: 3, semester: 1 }
    ];

    for (const subData of sampleSubjects) {
        let subject = await prisma.subject.findFirst({
            where: {
                name: subData.name,
                branchId: cse.id,
                year: subData.year,
                semester: subData.semester
            },
            include: { components: true }
        });

        if (!subject) {
            subject = await prisma.subject.create({
                data: {
                    name: subData.name,
                    year: subData.year,
                    semester: subData.semester,
                    branchId: cse.id
                },
                include: { components: true }
            });
        }

        let theoryComp = subject.components.find(c => c.type === 'THEORY');
        if (!theoryComp) {
            theoryComp = await prisma.subjectComponent.create({
                data: { type: 'THEORY', subjectId: subject.id }
            });

            for (let i = 1; i <= 5; i++) {
                await prisma.module.create({
                    data: {
                        name: 'Unit',
                        moduleNo: i,
                        componentId: theoryComp.id
                    }
                });
            }
        }

        let labComp = subject.components.find(c => c.type === 'LAB');
        if (!labComp) {
            labComp = await prisma.subjectComponent.create({
                data: { type: 'LAB', subjectId: subject.id }
            });

            for (let i = 1; i <= 5; i++) {
                await prisma.module.create({
                    data: {
                        name: 'Experiment',
                        moduleNo: i,
                        componentId: labComp.id
                    }
                });
            }
        }
    }

    console.log("JNTUH R22 CSE curriculum seeded successfully!");
}

main()
    .catch((e) => {
        console.error("Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


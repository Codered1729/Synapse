import express, { Request, Response } from 'express';
import prisma from '../config/prisma';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);


router.get('/regulations', async (req: Request, res: Response) => {
    try {
        const regulations = await prisma.regulation.findMany({
            include: { 
                branches: {
                    include: { 
                        subjects: {
                            include: { 
                                components: {
                                    include: { 
                                        modules: {
                                            orderBy: { moduleNo: 'asc' }, 
                                            include: { resources: true }
                                        } 
                                    }
                                },
                                resources: true
                            } 
                        }
                    } 
                }
            }
        });
        res.json(regulations);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/modules', async (req: Request, res: Response) => {
    try {
        const { name, moduleNo, componentId } = req.body;
        const module = await prisma.module.create({
            data: { 
                name, 
                moduleNo: Number(moduleNo), 
                componentId: Number(componentId) 
            }
        });
        res.status(201).json(module);
    } catch(err) {
        res.status(500).json({ error: "Failed to create module" });
    }
});

router.post('/regulations', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const regulation = await prisma.regulation.create({ data: { name } });
        res.status(201).json(regulation);
    } catch(err) {
        res.status(500).json({ error: "Failed to create regulation" });
    }
});

router.post('/branches', async (req: Request, res: Response) => {
    try {
        const { name, regulationId } = req.body;
        const branch = await prisma.branch.create({
            data: { name, regulationId: Number(regulationId) }
        });
        res.status(201).json(branch);
    } catch(err) {
        res.status(500).json({ error: "Failed to create branch" });
    }
});

router.post('/subjects', async (req: Request, res: Response) => {
    try {
        const { name, year, semester, branchId } = req.body;
        const subject = await prisma.subject.create({
            data: {
                name,
                year: Number(year),
                semester: Number(semester),
                branchId: Number(branchId)
            }
        });
        res.status(201).json(subject);
    } catch(err) {
        res.status(500).json({ error: "Failed to create subject" });
    }
});

router.post('/components', async (req: Request, res: Response) => {
    try {
        const { type, subjectId } = req.body; 
        const component = await prisma.subjectComponent.create({
            data: { type, subjectId: Number(subjectId) }
        });
        res.status(201).json(component);
    } catch(err) {
        res.status(500).json({ error: "Failed to create component" });
    }
});

router.post('/modules', async (req: Request, res: Response) => {
    try {
        const { name, moduleNo, componentId } = req.body; 
        
        const module = await prisma.module.create({
            data: { 
                name, 
                moduleNo: Number(moduleNo), 
                componentId: Number(componentId) 
            }
        });
        res.status(201).json(module);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create module" });
    }
});

router.post('/resources', async (req: Request, res: Response) => {
    try {
        const { fileName, fileUrl, subjectId, moduleIds } = req.body;
        
        const resource = await prisma.resource.create({
            data: {
                fileName,
                fileUrl,
                subjectId: Number(subjectId),
                modules: moduleIds && moduleIds.length > 0 ? {
                    connect: moduleIds.map((id: number | string) => ({ id: Number(id) }))
                } : undefined
            }
        });
        res.status(201).json(resource);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create resource" });
    }
});

export default router;
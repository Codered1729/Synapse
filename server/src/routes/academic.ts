import express, { Response } from 'express';
import prisma from '../config/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/regulations', async (req: AuthRequest, res: Response): Promise<void> => {
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
                                            include: { 
                                                resources: {
                                                    include: {
                                                        uploadedBy: {
                                                            select:{id : true , email:true}
                                                        }
                                                    }
                                                } 
                                            }
                                        } 
                                    }
                                },
                                resources: {
                                    include: {
                                        uploadedBy: {
                                            select: { id: true, email: true }
                                        }
                                    }
                                }
                            } 
                        }
                    } 
                }
            }
        });
        res.json(regulations);
    } catch (err) {
        console.error("Error fetching regulations hierarchy:", err);
        res.status(500).json({ error: "Server error fetching regulations" });
    }
});

router.post('/regulations', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            res.status(400).json({ error: "Regulation name is required" });
            return;
        }
        const regulation = await prisma.regulation.create({ data: { name: name.trim() } });
        res.status(201).json(regulation);
    } catch (err) {
        console.error("Error creating regulation:", err);
        res.status(500).json({ error: "Failed to create regulation" });
    }
});

router.post('/branches', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, regulationId } = req.body;
        if (!name || !regulationId) {
            res.status(400).json({ error: "Branch name and regulationId are required" });
            return;
        }
        const branch = await prisma.branch.create({
            data: { name: name.trim(), regulationId: Number(regulationId) }
        });
        res.status(201).json(branch);
    } catch (err) {
        console.error("Error creating branch:", err);
        res.status(500).json({ error: "Failed to create branch" });
    }
});

router.post('/subjects', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, year, semester, branchId } = req.body;
        if (!name || !year || !semester || !branchId) {
            res.status(400).json({ error: "Subject name, year, semester, and branchId are required" });
            return;
        }
        const subject = await prisma.subject.create({
            data: {
                name: name.trim(),
                year: Number(year),
                semester: Number(semester),
                branchId: Number(branchId)
            }
        });
        res.status(201).json(subject);
    } catch (err) {
        console.error("Error creating subject:", err);
        res.status(500).json({ error: "Failed to create subject" });
    }
});

router.post('/components', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, subjectId } = req.body;
        if (!type || !subjectId) {
            res.status(400).json({ error: "Component type and subjectId are required" });
            return;
        }
        const component = await prisma.subjectComponent.create({
            data: { type: type.trim(), subjectId: Number(subjectId) }
        });
        res.status(201).json(component);
    } catch (err) {
        console.error("Error creating component:", err);
        res.status(500).json({ error: "Failed to create component" });
    }
});

router.post('/modules', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, moduleNo, componentId } = req.body;
        if (!name || moduleNo === undefined || !componentId) {
            res.status(400).json({ error: "Module name, moduleNo, and componentId are required" });
            return;
        }
        const module = await prisma.module.create({
            data: { 
                name: name.trim(), 
                moduleNo: Number(moduleNo), 
                componentId: Number(componentId) 
            }
        });
        res.status(201).json(module);
    } catch (err) {
        console.error("Error creating module:", err);
        res.status(500).json({ error: "Failed to create module" });
    }
});

router.post('/resources', authorizeRoles('admin', 'student'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { fileName, fileUrl, subjectId, moduleIds, originalAuthor } = req.body;
        if (!fileName || !fileUrl || !subjectId) {
            res.status(400).json({ error: "File name, URL, and subjectId are required" });
            return;
        }
        const resource = await prisma.resource.create({
            data: {
                fileName: fileName.trim(),
                fileUrl: fileUrl.trim(),
                originalAuthor: originalAuthor? originalAuthor.trim() : null,
                uploadedById : req.user ? req.user.id : null,
                subjectId: Number(subjectId),
                modules: moduleIds && moduleIds.length > 0 ? {
                    connect: moduleIds.map((id: number | string) => ({ id: Number(id) }))
                } : undefined
            }
        });
        res.status(201).json(resource);
    } catch (err) {
        console.error("Error creating resource:", err);
        res.status(500).json({ error: "Failed to create resource" });
    }
});


router.delete('/regulations/:id', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.regulation.delete({ where: { id } });
        res.json({ message: "Regulation deleted successfully" });
    } catch (err) {
        console.error("Error deleting regulation:", err);
        res.status(500).json({ error: "Failed to delete regulation" });
    }
});

router.delete('/branches/:id', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.branch.delete({ where: { id } });
        res.json({ message: "Branch deleted successfully" });
    } catch (err) {
        console.error("Error deleting branch:", err);
        res.status(500).json({ error: "Failed to delete branch" });
    }
});

router.delete('/subjects/:id', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.subject.delete({ where: { id } });
        res.json({ message: "Subject deleted successfully" });
    } catch (err) {
        console.error("Error deleting subject:", err);
        res.status(500).json({ error: "Failed to delete subject" });
    }
});

router.delete('/components/:id', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.subjectComponent.delete({ where: { id } });
        res.json({ message: "Component deleted successfully" });
    } catch (err) {
        console.error("Error deleting component:", err);
        res.status(500).json({ error: "Failed to delete component" });
    }
});

router.delete('/modules/:id', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.module.delete({ where: { id } });
        res.json({ message: "Module deleted successfully" });
    } catch (err) {
        console.error("Error deleting module:", err);
        res.status(500).json({ error: "Failed to delete module" });
    }
});

router.delete('/resources/:id', authorizeRoles('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.resource.delete({ where: { id } });
        res.json({ message: "Resource deleted successfully" });
    } catch (err) {
        console.error("Error deleting resource:", err);
        res.status(500).json({ error: "Failed to delete resource" });
    }
});

export default router;
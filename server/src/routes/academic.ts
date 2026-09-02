import {Router} from "express"
import prisma from '../config/prisma'

const router = Router()

router.post('/regulations', async (req,res) =>{
    try{
        const {name} = req.body
        const regulation = await prisma.regulation.create({
            data:{name}
        })
        res.status(201).json(regulation)
    } catch(err){
        console.error(err)
        res.status(500).json({error :"failed to create regulation"})
    }
});

router.get('/regulations', async (req,res)=>{
    try{
        const regulations = await prisma.regulation.findMany({
            include:{branches :true}
        })
        res.json(regulations)
    } catch (err){
        console.error(err)
        res.status(500).json({error: "failed to fetch regulations"})
    }
})

router.post('/branches', async(req,res)=>{
    try{
        const {name , regulationId} = req.body
        const branch = await prisma.branch.create({
            data:{
                name,
                regulationId:parseInt(regulationId)
            }
        })
        res.status(201).json(branch)
    } catch(err){
        console.error(err)
        res.status(500).json({error: "failed to create branch"})
    }
})

export default router
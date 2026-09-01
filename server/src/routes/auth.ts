import express, {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import pool from "../config/db"

const router = express.Router();

router.post("/login", async (req: Request, res : Response):Promise<void> =>{
    const {email, password} = req.body
    try{
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        const user = result.rows[0]

        if(!user){
            res.status(401).json({error :"Invalid credentials"})
            return
        }
        const isValid = await bcrypt.compare(password, user.password_hash)
        if(!isValid){
            res.status(401).json({error : "Invalid credentials"})
            return
        }
        const token = jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET as string,
            {expiresIn : "1d"}
        )

        res.json({token, role : user.role})
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Server error"})
    }
})

export default router;
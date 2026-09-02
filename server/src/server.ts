import express,{Request, Response} from "express";
import pool from "./config/prisma"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import authRoutes from "./routes/auth"
import academicRoutes from "./routes/academic"

dotenv.config({path: path.resolve(__dirname , "../../.env")})

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173" 

app.use(cors({
  origin : CLIENT_URL,
  credentials : true
}))
app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api/academic",academicRoutes)

app.get("/",(req: Request,res:Response)=>{
  res.send("hello");
});

const startServer = async ()=>{
  try{
    await pool.$connect()
    console.log("postgresql connected")
    app.listen(PORT, ()=>{
      console.log(`Server running on port ${PORT}`)
    })
  } catch(err){
    console.log("database connection error:", err)
    process.exit(1);
  }
}
startServer()
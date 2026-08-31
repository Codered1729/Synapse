import express,{Request, Response} from "express";
import pool from "./config/db"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"


dotenv.config({path: path.resolve(__dirname , "../../.env")})

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5317" 
app.use(cors({
  origin : CLIENT_URL,
  credentials : true
}))

app.use(express.json());

app.get("/",(req: Request,res:Response)=>{
  res.send("hello");
});

const startServer = async ()=>{
  try{
    const client = await pool.connect()
    console.log("PostgreSQL Connected")
    client.release()
    app.listen(PORT, ()=>{
      console.log('Server running on port : ${PORT}')
    })
  } catch(err){
    console.log("database connection error:", err)
    process.exit(1);
  }
}
startServer()
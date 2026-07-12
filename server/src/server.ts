import express,{Request, Response} from "express";
import pool from "./config/db"

const app = express();

app.use(express.json());

app.get("/",(req: Request,res:Response)=>{
  res.send("hello");
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
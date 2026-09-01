import {useState, type FormEvent} from "react"
import { useNavigate } from "react-router-dom"
export default function Login(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("http://localhost:5000/api/auth/login",{
                method : "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({email,password}),
            })
            
            if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: Route not found or server error.`);
            }
            const data = await res.json();

            localStorage.setItem("token", data.token)
            navigate("/dashboard")
        } catch (err : any){
            setError(err.message)
        }
    }
    return (
        <div className="login-container">
            <form onSubmit = {handleLogin}>
                <h2>Admin Login</h2>
                {error && <p style = {{color:"red"}}>{error}</p> }
                <input 
                    type = "email"
                    placeholder="Email"
                    value = {email}
                    onChange= {(e)=> setEmail(e.target.value)}
                    required
                />
                <input
                    type = "password"
                    placeholder="password"
                    value = {password}
                    onChange={(e)=> setPassword(e.target.value)}
                    required
                />
                <button type = "submit">log in</button>
            </form>
        </div>
    )
}
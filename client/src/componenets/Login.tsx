import {useState, type FormEvent} from "react"
export default function Login(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("http://localhost:5000/api/auth/login",{
                method : "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({email,password}),
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error);

            localStorage.setItem("token", data.token)
            alert("login successful token saved")
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
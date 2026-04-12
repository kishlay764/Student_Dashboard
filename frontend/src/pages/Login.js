import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/login.css";

function Login() {

    const nav = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (data.token) {
            localStorage.setItem("token", data.token)
            alert("Login Success")
            nav("/dashboard")
        } else {
            alert(data.message)
        }
    }

    return (
        <div className="login-page">

            <div className="login-box">

                <h2>Login</h2>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin}>
                    Login
                </button>
                <p onClick={() => nav("/signup")} style={{ cursor: "pointer" }}>
                    New User? Signup
                </p>

            </div>

        </div>
    )
}

export default Login;
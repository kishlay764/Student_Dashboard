import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Signup() {

    const nav = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSignup = async () => {

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        alert(data.message)
        nav("/")
    }

    return (
        <div className="login-page">

            <div className="login-box">

                <h2>Signup</h2>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleSignup}>
                    Signup
                </button>

            </div>

        </div>
    )
}

export default Signup;
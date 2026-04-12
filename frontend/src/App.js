import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";

function App() {

    const [dark, setDark] = useState(false)

    return (
        <div style={{
            background: dark ? "#121212" : "#f5f5f5",
            color: dark ? "white" : "black",
            minHeight: "100vh"
        }}>

            <BrowserRouter>

                <button
                    onClick={() => setDark(!dark)}
                    style={{
                        position: "absolute",
                        right: "20px",
                        top: "20px",
                        padding: "8px"
                    }}
                >
                    Toggle Mode
                </button>

                <Navbar />

                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/signup" element={<Signup />} />
                </Routes>

            </BrowserRouter>

        </div>
    );
}

export default App;
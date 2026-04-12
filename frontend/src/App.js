import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Signup from "./pages/Signup";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import MainLayout from "./components/layout/MainLayout";

function App() {
    return (
        <BrowserRouter>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/focus" element={<Focus />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
}

export default App;
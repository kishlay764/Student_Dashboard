import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, ArrowRight, User } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function Signup() {
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            const errorMessage = data.message || data.error || "Signup failed";
            
            if (res.ok) {
                alert(data.message || "Account created successfully!");
                nav("/");
            } else {
                alert(errorMessage);
            }
        } catch (err) {
            alert("Unable to reach server. Make sure backend is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                            <UserPlus className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic tracking-tight">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Join our community and start being productive</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input 
                            label="Full Name"
                            placeholder="John Doe"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            icon={<User size={18} />}
                        />
                        <Input 
                            label="Email Address"
                            placeholder="name@example.com"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={18} />}
                        />
                        <Input 
                            label="Password"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} />}
                        />

                        <div className="pt-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                By signing up, you agree to our <button type="button" className="text-blue-600 hover:underline">Terms of Service</button> and <button type="button" className="text-blue-600 hover:underline">Privacy Policy</button>.
                            </p>
                        </div>

                        <Button 
                            type="submit" 
                            variant="primary"
                            className="w-full h-12 text-lg font-semibold flex items-center justify-center gap-2 group bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : (
                                <>
                                    Create Account
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Signup;

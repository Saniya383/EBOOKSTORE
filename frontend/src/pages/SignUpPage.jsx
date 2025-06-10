import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import Logo from "../components/Logo";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [step, setStep] = useState("signup"); // "signup" or "otp"
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const { signup, loading } = useUserStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(formData); // Assuming this registers the user
        // Send OTP after successful signup
        setOtpLoading(true);
        setOtpError("");
        try {
            const res = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            if (res.ok) {
                setStep("otp");
            } else {
                setOtpError("Failed to send OTP. Please try again.");
            }
        } catch {
            setOtpError("Failed to send OTP. Please try again.");
        }
        setOtpLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setOtpError("");
        try {
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            if (res.ok) {
                // OTP verified, redirect or show success
                alert("Email verified! You can now log in.");
                // Optionally redirect to login page
            } else {
                setOtpError("Invalid or expired OTP.");
            }
        } catch {
            setOtpError("Verification failed. Please try again.");
        }
        setOtpLoading(false);
    };

    return (
        <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <motion.div
                className='sm:mx-auto sm:w-full sm:max-w-md'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex justify-center mb-6">
                    <Logo size="large" />
                </div>
                <h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>
                    {step === "signup" ? "Create your account" : "Verify your email"}
                </h2>
            </motion.div>

            <motion.div
                className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    {step === "signup" ? (
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            {/* ...existing sign-up form fields... */}
                            {/* (keep your current form code here) */}
                            <button
                                type='submit'
                                className='w-full flex justify-center py-2 px-4 border border-transparent 
                                rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
                                 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                                  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
                                disabled={loading || otpLoading}
                            >
                                {loading || otpLoading ? (
                                    <>
                                        <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
                                        Sign up
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className='space-y-6'>
                            <div>
                                <label htmlFor='otp' className='block text-sm font-medium text-gray-300'>
                                    Enter OTP sent to your email
                                </label>
                                <input
                                    id='otp'
                                    type='text'
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className='block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm
                                     placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                                    placeholder='6-digit code'
                                />
                            </div>
                            {otpError && <div className="text-red-400">{otpError}</div>}
                            <button
                                type='submit'
                                className='w-full flex justify-center py-2 px-4 border border-transparent 
                                rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
                                 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                                  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
                                disabled={otpLoading}
                            >
                                {otpLoading ? (
                                    <>
                                        <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Mail className='mr-2 h-5 w-5' aria-hidden='true' />
                                        Verify OTP
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === "signup" && (
                        <p className='mt-8 text-center text-sm text-gray-400'>
                            Already have an account?{" "}
                            <Link to='/login' className='font-medium text-emerald-400 hover:text-emerald-300'>
                                Login here <ArrowRight className='inline h-4 w-4' />
                            </Link>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
export default SignUpPage;
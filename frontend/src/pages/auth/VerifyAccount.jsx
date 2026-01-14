import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
    CheckCircle,
    Lock,
    Mail,
    ShieldCheck,
    Loader2,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [validToken, setValidToken] = useState(false);
    const [user, setUser] = useState(null);
    const [step, setStep] = useState('password'); // password, otp
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: '',
    });

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid verification link.');
            navigate('/login');
            return;
        }

        const validateToken = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/auth/verify-token/${token}`);
                setUser(response.data.user);
                setValidToken(true);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Invalid or expired verification link.');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, [token, navigate]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match.');
            return;
        }

        setVerifying(true);
        try {
            const response = await axios.post('http://localhost:8000/api/auth/set-password', {
                token,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });
            toast.success(response.data.message);
            setStep('otp');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set password.');
        } finally {
            setVerifying(false);
        }
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP.');
            return;
        }

        setOtpLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/auth/activate-account', {
                email: user.email,
                otp: otpCode,
            });

            toast.success('Account activated successfully!');

            // Auto login using context
            setAuth(response.data.token, response.data.user);

            // Redirect based on role
            navigate(response.data.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP.');
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            {step === 'password' ? (
                                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            ) : (
                                <Lock className="w-8 h-8 text-indigo-600" />
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {step === 'password' ? 'Set Up Your Password' : 'Verify Your Identity'}
                        </h1>
                        <p className="text-slate-500">
                            {step === 'password'
                                ? `Hello ${user?.name}, please create a secure password for your account.`
                                : `We've sent a 6-digit code to ${user?.email}. Please enter it below.`
                            }
                        </p>
                    </div>

                    {step === 'password' ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">New Password</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock className="w-5 h-5" />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Min. 8 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Repeat password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={verifying}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                            >
                                {verifying ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Continue to Verification</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-8">
                            <div className="flex justify-center gap-2">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        value={data}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onFocus={(e) => e.target.select()}
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={otpLoading}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                                >
                                    {otpLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Verify and Activate</span>
                                            <CheckCircle className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-sm text-slate-500">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                        onClick={() => toast.success('A new code has been sent.')} // Placeholder for resend OTP
                                    >
                                        Resend Code
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyAccount;

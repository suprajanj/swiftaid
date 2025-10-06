import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  IdCard,
} from "lucide-react";

export default function LoginandSignup() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isOTPStep, setIsOTPStep] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTPVerifyStep, setIsOTPVerifyStep] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);
  const [userId, setUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    address: "",
    gender: "",
    dob: "",
    terms: false,
    otp: "",
  });

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/user/login", {
        email: formData.email,
        password: formData.password,
      });

      setUserId(res.data.userId);
      toast.success("OTP sent to your email.");
      setIsOTPStep(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    }
  };

  // --------------------------------------------------
  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!passwordRegex.test(formData.password))
      return toast.error(
        "Password must have 8+ chars, an uppercase, number, and special char."
      );
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match.");
    if (!formData.terms)
      return toast.error("You must agree to terms and conditions.");

    try {
      const res = await axios.post("http://localhost:3000/api/user", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nic: formData.nic,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        mobile: formData.mobile,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob,
        termsAccepted: formData.terms,
      });

      toast.success(res.data.message || "Signup successful!");
      setIsLogin(true);
      // Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        nic: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        address: "",
        gender: "",
        dob: "",
        terms: false,
        otp: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD - STEP 1 (Request OTP)
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) return toast.error("Enter your email.");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/forgot-password",
        { email: formData.email }
      );

      toast.success(res.data.message || "OTP sent to your email.");
      localStorage.setItem("resetUserId", res.data.userId);
      setIsOTPVerifyStep(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD - STEP 2 (Verify OTP)
  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    const storedUserId = localStorage.getItem("resetUserId");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/verify-reset-otp",
        {
          userId: storedUserId,
          otp: formData.otp,
        }
      );

      toast.success(res.data.message || "OTP verified.");
      setIsOTPVerifyStep(false);
      setIsResetStep(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD - STEP 3 (Reset Password)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const storedUserId = localStorage.getItem("resetUserId");

    if (!passwordRegex.test(formData.password))
      return toast.error(
        "Password must have 8+ chars, an uppercase, number, and special char."
      );
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match.");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/reset-password",
        {
          userId: storedUserId,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      toast.success(res.data.message || "Password reset successful!");
      localStorage.removeItem("resetUserId");
      setIsForgotPassword(false);
      setIsResetStep(false);
      setIsLogin(true);
      // Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        nic: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        address: "",
        gender: "",
        dob: "",
        terms: false,
        otp: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed.");
    }
  };

  // --------------------------------------------------
  // OTP Verification for Login
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Enter your OTP.");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/verify-otp",
        { userId, otp: formData.otp }
      );

      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");
      setIsOTPStep(false);

      const role = res.data.role || "user";
      switch (role) {
        case "Admin":
          navigate("/dashboard");
          break;
        case "Responder - Hospital":
        case "Responder - Fire":
        case "Responder - Police":
          navigate("/responder");
          break;
        case "Dispatcher":
          navigate("/dispatcher");
          break;
        case "Fund raiser":
          navigate("/funds");
          break;
        case "Supportive organization":
          navigate("/org");
          break;
        default:
          navigate("/homepage");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed.");
    }
  };

  // --------------------------------------------------
  // FORM UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* LEFT SIDE */}
          <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold">SwiftAid</h1>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {isOTPStep
                  ? "Secure Verification"
                  : isForgotPassword
                    ? "Reset Your Password"
                    : isLogin
                      ? "Welcome Back"
                      : "Join Our Community"}
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                {isOTPStep
                  ? "Enter the verification code sent to your email to secure your account."
                  : isForgotPassword
                    ? "Recover access to your account securely."
                    : isLogin
                      ? "Sign in to access emergency services and manage your safety profile."
                      : "Create your account to access comprehensive emergency response services."}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
            {/* HEADING SECTION */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isOTPStep
                  ? "Verify Your Identity"
                  : isForgotPassword && !isOTPVerifyStep && !isResetStep
                    ? "Forgot Password"
                    : isOTPVerifyStep
                      ? "Verify OTP"
                      : isResetStep
                        ? "Reset Password"
                        : isLogin
                          ? "Sign In"
                          : "Create Account"}
              </h2>
              <p className="text-gray-600">
                {isOTPStep
                  ? "Enter the 6-digit code sent to your email"
                  : isForgotPassword && !isOTPVerifyStep && !isResetStep
                    ? "Enter your email to receive a verification code"
                    : isOTPVerifyStep
                      ? "Enter the OTP sent to your email"
                      : isResetStep
                        ? "Create your new password"
                        : isLogin
                          ? "Enter your credentials to access your account"
                          : "Fill in your details to get started"}
              </p>
            </div>

            {/* LOGIN OTP STEP */}
            {isOTPStep && (
              <form onSubmit={handleVerifyLoginOTP} className="space-y-6">
                <button
                  onClick={() => setIsOTPStep(false)}
                  type="button"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Login</span>
                </button>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      #
                    </div>
                  </div>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength="6"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono tracking-widest"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Verify & Continue
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD STEPS */}
            {!isOTPStep && isForgotPassword && (
              <>
                {/* STEP 1: Request OTP */}
                {!isOTPVerifyStep && !isResetStep && (
                  <form onSubmit={handleRequestOTP} className="space-y-6">
                    <button
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsLogin(true);
                      }}
                      type="button"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2 transition-colors"
                    >
                      <ArrowLeft size={18} />
                      <span>Back to Login</span>
                    </button>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your registered email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Send Verification Code
                    </button>
                  </form>
                )}

                {/* STEP 2: Verify OTP */}
                {isOTPVerifyStep && !isResetStep && (
                  <form onSubmit={handleVerifyResetOTP} className="space-y-6">
                    <button
                      onClick={() => setIsOTPVerifyStep(false)}
                      type="button"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2 transition-colors"
                    >
                      <ArrowLeft size={18} />
                      <span>Back</span>
                    </button>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          #
                        </div>
                      </div>
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        maxLength="6"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono tracking-widest"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Verify OTP
                    </button>
                  </form>
                )}

                {/* STEP 3: Reset Password */}
                {isResetStep && (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <button
                      onClick={() => setIsResetStep(false)}
                      type="button"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2 transition-colors"
                    >
                      <ArrowLeft size={18} />
                      <span>Back</span>
                    </button>

                    {/* NEW PASSWORD */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="New Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Reset Password
                    </button>
                  </form>
                )}
              </>
            )}

            {/* LOGIN OR SIGNUP FORM */}
            {!isForgotPassword && !isOTPStep && (
              <form
                onSubmit={isLogin ? handleLogin : handleSignup}
                className="space-y-6"
              >
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="NIC"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer-not">Prefer not to say</option>
                      </select>

                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {!isLogin && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                        className="rounded focus:ring-blue-500 mt-1"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the Terms and Conditions & Privacy Policy
                      </span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </button>

                {isLogin && (
                  <p
                    onClick={() => {
                      setIsForgotPassword(true);
                      setIsLogin(false);
                    }}
                    className="text-right text-blue-600 hover:text-blue-700 cursor-pointer transition-colors font-medium"
                  >
                    Forgot Password?
                  </p>
                )}
              </form>
            )}

            {/* SWITCH LOGIN/SIGNUP */}
            {!isOTPStep && !isForgotPassword && (
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setIsForgotPassword(false);
                      setIsResetStep(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                  >
                    {isLogin ? "Create Account" : "Sign In"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

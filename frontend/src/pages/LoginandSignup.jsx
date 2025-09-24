import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function LoginandSignup() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isOTPStep, setIsOTPStep] = useState(false);
  const [userId, setUserId] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      // SIGNUP
      if (!passwordRegex.test(formData.password)) {
        return toast.error(
          "Password must be at least 8 characters, include uppercase, number, and special char."
        );
      }
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match.");
      }
      if (!formData.terms) {
        return toast.error("You must agree to terms.");
      }

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

        toast.success(res.data.message);
        setIsLogin(true);
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
    } else {
      // LOGIN → OTP
      try {
        const res = await axios.post("http://localhost:3000/api/user/login", {
          email: formData.email,
          password: formData.password,
        });

        setUserId(res.data.userId);
        setIsOTPStep(true);
        toast.success("OTP sent to your email.");
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed.");
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Please enter OTP.");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/verify-otp",
        { userId, otp: formData.otp }
      );

      // ✅ Store JWT in localStorage
      localStorage.setItem("token", res.data.token);

      toast.success(res.data.message + " — Logged in successfully!");

      // ✅ Role-based navigation
      const role = res.data.role || "user";
      switch (role.toLowerCase()) {
        case "admin":
          navigate("/dashboard");
          break;
        case "responder":
          navigate("/responder");
          break;
        case "dispatcher":
          navigate("/dispatcher");
          break;
        case "fund raiser":
          navigate("/funds");
          break;
        case "organization":
          navigate("/org");
          break;
        default:
          navigate("/homepage");
      }

      // Reset form and states
      setIsOTPStep(false);
      setIsLogin(true);
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
      toast.error(err.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {!isOTPStep ? (isLogin ? "Login" : "Sign Up") : "Enter OTP"}
        </h2>

        {!isOTPStep ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-1/2 border px-3 py-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-1/2 border px-3 py-2 rounded"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="NIC"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />

            {!isLogin && (
              <>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  <span>I agree to Terms and Conditions</span>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Verify OTP
            </button>
          </form>
        )}

        {!isOTPStep && (
          <p className="mt-4 text-center text-sm">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

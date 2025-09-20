// LoginandSignup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

  // -------------------- Handle Signup / Login --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      // SIGNUP
      if (!passwordRegex.test(formData.password)) {
        toast.error(
          "Password must be at least 8 characters, include one uppercase letter, one number, and one special character."
        );
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (!formData.terms) {
        toast.error("You must agree to the terms and conditions.");
        return;
      }

      try {
        const response = await axios.post("http://localhost:3000/api/user", {
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

        toast.success(response.data.message);
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
      } catch (error) {
        if (error.response && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Try again!");
        }
      }
    } else {
      // LOGIN
      try {
        const res = await axios.post("http://localhost:3000/api/user/login", {
          email: formData.email,
          password: formData.password,
        });

        setUserId(res.data.userId);
        setIsOTPStep(true);
        toast.success("OTP has been sent to your email.");
      } catch (err) {
        if (err.response && err.response.data.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Something went wrong during login");
        }
      }
    }
  };

  // -------------------- Handle OTP Verification --------------------
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/user/verify-otp",
        {
          userId,
          otp: formData.otp,
        }
      );

      toast.success(res.data.message + " — You are now logged in!");
      navigate("/homepage");

      setIsOTPStep(false);
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
      setIsLogin(true);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("OTP verification failed");
      }
    }
  };

  // -------------------- JSX --------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />{" "}
      {/* toast container */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {!isOTPStep ? (isLogin ? "Login" : "Sign Up") : "Enter OTP"}
        </h2>

        {!isOTPStep ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Signup fields */}
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">NIC Number</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label className="text-sm">
                    I agree to the{" "}
                    <a href="#" className="text-blue-500 underline">
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              </>
            )}

            {/* Email + Password fields */}
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
        ) : (
          // OTP Form
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
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

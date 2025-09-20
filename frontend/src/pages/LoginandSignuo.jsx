// LoginandSignup.jsx
import React, { useState } from "react";

export default function LoginandSignup() {
  const [isLogin, setIsLogin] = useState(true); // toggle state
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
  });
  const [error, setError] = useState("");

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      if (!passwordRegex.test(formData.password)) {
        setError(
          "Password must be at least 8 characters, include one uppercase letter, one number, and one special character."
        );
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!formData.terms) {
        setError("You must agree to the terms and conditions.");
        return;
      }
      console.log("Signup successful:", formData);
    } else {
      console.log("Login successful with:", {
        email: formData.email,
        password: formData.password,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
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
                <label className="block mb-1 font-medium">Mobile Number</label>
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
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  required
                />
              </div>
            </>
          )}

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

          {!isLogin && (
            <>
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

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

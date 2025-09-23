// src/lib/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // adjust if backend runs on another port
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

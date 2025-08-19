import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage 
let resources = [];
let donations = [];

// Health check
app.get('/', (req, res) => {
  res.send('SwiftAid Backend is Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(` SwiftAid Server running on port ${PORT}`);
});

export default app;

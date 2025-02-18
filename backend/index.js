require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");
const app = express();


const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

connectDB();


app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/folders", require("./src/routes/folderRoutes"));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


if (process.env.NODE_ENV === "production") {
  // Serve static files from the React app's build directory
  app.use(express.static(path.join(__dirname, "frontend", "build")));
  
  // Fallback to React's index.html for any unknown routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

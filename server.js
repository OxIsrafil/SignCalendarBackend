const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Routes
const eventRoutes = require("./routes/events");
app.use("/api/events", eventRoutes);

// Root check
app.get("/", (req, res) => {
  res.send("🚀 Sign Scheduler Backend is Running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

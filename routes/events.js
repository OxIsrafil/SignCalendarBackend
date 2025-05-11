const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// 🔓 Public: Get only approved events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ approved: true }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved events." });
  }
});

// 🔐 Admin: Get all events
router.get("/all", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all events." });
  }
});

// 📝 Submit event (unapproved by default)
router.post("/", async (req, res) => {
  try {
    const { title, date, time } = req.body;

    // ✅ Validate input
    if (!title || !date || !time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ⛔ Check for time clash
    const conflict = await Event.findOne({ date, time });
    if (conflict) {
      return res.status(409).json({ error: "An event already exists at this time." });
    }

    const newEvent = new Event(req.body); // default approved = false
    await newEvent.save();

    res.status(201).json({ message: "Event submitted for approval." });
  } catch (err) {
    console.error("❌ Event submission failed:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ✅ Approve event
router.patch("/:id/approve", async (req, res) => {
  try {
    const approvedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!approvedEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.json({ message: "Event approved.", event: approvedEvent });
  } catch (err) {
    res.status(400).json({ error: "Failed to approve event." });
  }
});

// ❌ Reject/Delete event
router.delete("/:id", async (req, res) => {
  try {
    const removed = await Event.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete event." });
  }
});

module.exports = router;

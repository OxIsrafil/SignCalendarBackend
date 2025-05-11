const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// 🔓 Public - Get only approved events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ approved: true }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved events." });
  }
});

// 🔐 Admin - Get all events (including unapproved)
router.get("/all", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all events." });
  }
});

// 📝 Submit event (pending approval)
router.post("/", async (req, res) => {
  try {
    const { date, time, title } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existing = await Event.findOne({ date, time });
    if (existing) {
      return res.status(409).json({ error: "Event clash at the selected time." });
    }

    const event = new Event(req.body); // approved: false by default
    await event.save();
    res.status(201).json({ message: "Event submitted for approval." });

  } catch (err) {
    console.error("Error submitting event:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ✅ Approve event (admin only)
router.patch("/:id/approve", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.json({ message: "Event approved successfully.", event: updated });
  } catch (err) {
    res.status(400).json({ error: "Failed to approve event." });
  }
});

// ❌ Reject/Delete event (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.json({ message: "Event rejected and deleted." });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete event." });
  }
});

module.exports = router;

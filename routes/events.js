const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Public: Get only approved events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ approved: true });

    const now = new Date();
    const [upcoming, finished] = events.reduce(
      ([up, fin], ev) => {
        const evTime = new Date(`${ev.date}T${ev.time}`);
        return evTime >= now ? [[...up, ev], fin] : [up, [...fin, ev]];
      },
      [[], []]
    );

    res.json([...upcoming.sort((a, b) => a.date.localeCompare(b.date)), ...finished]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved events." });
  }
});

// Admin: Get all events
router.get("/all", async (req, res) => {
  try {
    const events = await Event.find();
    const now = new Date();
    const [upcoming, finished] = events.reduce(
      ([up, fin], ev) => {
        const evTime = new Date(`${ev.date}T${ev.time}`);
        return evTime >= now ? [[...up, ev], fin] : [up, [...fin, ev]];
      },
      [[], []]
    );
    res.json([...upcoming, ...finished]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all events." });
  }
});

// Submit event
router.post("/", async (req, res) => {
  try {
    const { title, date, time } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const conflict = await Event.findOne({ date, time });
    if (conflict) {
      return res.status(409).json({ error: "An event already exists at this time." });
    }

    const newEvent = new Event(req.body);
    await newEvent.save();

    res.status(201).json({ message: "Event submitted for approval." });
  } catch (err) {
    console.error("❌ Event submission failed:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Approve
router.patch("/:id/approve", async (req, res) => {
  try {
    const approvedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!approvedEvent) return res.status(404).json({ error: "Event not found." });
    res.json({ message: "Event approved.", event: approvedEvent });
  } catch (err) {
    res.status(400).json({ error: "Failed to approve event." });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const removed = await Event.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: "Event not found." });
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete event." });
  }
});

module.exports = router;

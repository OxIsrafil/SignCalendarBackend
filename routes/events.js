const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET only approved events (public)
router.get("/", async (req, res) => {
  const events = await Event.find({ approved: true }).sort({ date: 1 });
  res.json(events);
});

// GET all events (admin)
router.get("/all", async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// POST new event (default approved = false)
router.post("/", async (req, res) => {
  const { date, time } = req.body;
  const existing = await Event.findOne({ date, time });

  if (existing) {
    return res.status(409).json({ message: "Clash" });
  }

  const event = new Event(req.body);
  await event.save();
  res.status(201).json(event);
});

// PATCH approve event (admin)
router.patch("/:id/approve", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Approve failed" });
  }
});

// DELETE event (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const generateICS = require('../utils/icsGenerator');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event (with clash detection)
router.post('/', async (req, res) => {
  try {
    const { title, description, location, date, time } = req.body;

    const conflict = await Event.findOne({ date, time });
    if (conflict) {
      return res.status(409).json({ message: 'Event clash detected' });
    }

    const newEvent = new Event({ title, description, location, date, time });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Download event as .ics
router.get('/:id/download', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ics = generateICS(event);
    res.setHeader('Content-Disposition', 'attachment; filename=event.ics');
    res.setHeader('Content-Type', 'text/calendar');
    res.send(ics);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading .ics file' });
  }
});

module.exports = router;

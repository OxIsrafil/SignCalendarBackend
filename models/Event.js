const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }  // Format: HH:mm
});

module.exports = mongoose.model('Event', eventSchema);

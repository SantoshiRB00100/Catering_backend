const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  guestCount: { type: Number, required: true },
  venue: { type: String, required: true },
  package: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled'], default: 'pending' },
  specialRequests: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
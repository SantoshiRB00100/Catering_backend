const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  next();
};

// Create reservation (customer)
router.post('/', auth, async (req, res) => {
  try {
    const { eventDate, eventTime, guestCount, venue, package: pkg, specialRequests } = req.body;

    const reservation = await Reservation.create({
      user: req.user.id,
      eventDate,
      eventTime,
      guestCount,
      venue,
      package: pkg,
      specialRequests
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my reservations (customer)
router.get('/my', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all reservations (admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('user', 'name email phone');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Confirm or reject reservation (admin)
router.put('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ msg: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel reservation (customer)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ msg: 'Reservation not found' });
    if (reservation.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });
    if (reservation.status !== 'pending') return res.status(400).json({ msg: 'Only pending reservations can be cancelled' });

    reservation.status = 'cancelled';
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
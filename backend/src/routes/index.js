const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const authMiddleware = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');
const { getTickets, getTicketById } = require('../controllers/ticketController');
const { createBooking, getMyBookings, getBookingByCode, cancelBooking } = require('../controllers/bookingController');
const { submitPayment, getPaymentStatus } = require('../controllers/paymentController');

// Multer storage for payment proof
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG/PNG images are allowed'));
  }
});

// =====================
// AUTH ROUTES
// =====================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);

// =====================
// TICKET ROUTES
// =====================
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);

// =====================
// BOOKING ROUTES (Protected)
// =====================
router.post('/bookings', authMiddleware, createBooking);
router.get('/bookings', authMiddleware, getMyBookings);
router.get('/bookings/:code', authMiddleware, getBookingByCode);
router.put('/bookings/:code/cancel', authMiddleware, cancelBooking);

// =====================
// PAYMENT ROUTES (Protected)
// =====================
router.post('/payments', authMiddleware, upload.single('payment_proof'), submitPayment);
router.get('/payments/:code', authMiddleware, getPaymentStatus);

// =====================
// QA SANDBOX ROUTES (Special testing endpoints)
// =====================
router.get('/qa/slow-response', (req, res) => {
  setTimeout(() => {
    res.json({ success: true, message: 'Delayed response after 3 seconds', delay: 3000 });
  }, 3000);
});

router.get('/qa/random-fail', (req, res) => {
  const shouldFail = Math.random() > 0.5;
  if (shouldFail) {
    return res.status(500).json({ success: false, message: 'Random server error (50% chance)', error_code: 'RANDOM_FAIL' });
  }
  return res.json({ success: true, message: 'Request succeeded (50% chance)' });
});

router.get('/qa/session-expired', (req, res) => {
  res.status(401).json({ success: false, message: 'Session expired. Please login again.', error_code: 'TOKEN_EXPIRED' });
});

router.post('/qa/duplicate-submit', (req, res) => {
  res.status(409).json({ success: false, message: 'Duplicate submission detected.', error_code: 'DUPLICATE_SUBMIT' });
});

router.get('/qa/infinite-loading', (req, res) => {
  // Never responds - simulates infinite loading
});

module.exports = router;

const { pool } = require('../config/database');
const path = require('path');

// POST /api/payments - Submit payment
const submitPayment = async (req, res) => {
  try {
    const { booking_code, payment_method } = req.body;
    const userId = req.user.id;

    if (!booking_code || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'booking_code and payment_method are required.'
      });
    }

    const validMethods = ['bank_transfer', 'ewallet', 'credit_card'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Use: bank_transfer, ewallet, or credit_card'
      });
    }

    // Get booking
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE booking_code = ? AND user_id = ?',
      [booking_code, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled booking.'
      });
    }

    // Get payment
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE booking_id = ?',
      [booking.id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = payments[0];

    // Check expired
    if (payment.expired_at && new Date(payment.expired_at) < new Date()) {
      await pool.execute(
        "UPDATE payments SET payment_status = 'failed' WHERE id = ?",
        [payment.id]
      );
      return res.status(400).json({
        success: false,
        message: 'Payment has expired.',
        error_code: 'PAYMENT_EXPIRED'
      });
    }

    const proofFile = req.file ? req.file.filename : null;

    // Update payment
    await pool.execute(
      `UPDATE payments 
       SET payment_method = ?, payment_status = 'success', payment_proof = ?, paid_at = NOW()
       WHERE id = ?`,
      [payment_method, proofFile, payment.id]
    );

    // Confirm booking
    await pool.execute(
      "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
      [booking.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Payment successful! Your booking is confirmed.',
      data: {
        booking_code,
        payment_code: payment.payment_code,
        amount: payment.amount,
        payment_method,
        paid_at: new Date().toISOString(),
        status: 'success'
      }
    });

  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET /api/payments/:code - Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;

    const [payments] = await pool.execute(
      `SELECT p.*, b.booking_code, b.total_price, b.status AS booking_status
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.payment_code = ? AND p.user_id = ?`,
      [code, userId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    return res.status(200).json({ success: true, data: payments[0] });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { submitPayment, getPaymentStatus };

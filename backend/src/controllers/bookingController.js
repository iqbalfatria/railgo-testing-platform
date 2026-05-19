const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Generate booking code
const generateBookingCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `RG-${year}-${random}`;
};

// POST /api/bookings - Create booking
const createBooking = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { schedule_id, departure_date, passenger_count, seat_numbers, passengers } = req.body;
    const userId = req.user.id;

    if (!schedule_id || !departure_date || !passenger_count) {
      return res.status(400).json({
        success: false,
        message: 'schedule_id, departure_date, and passenger_count are required.',
      });
    }

    // Check schedule exists
    const [schedules] = await conn.execute(
      'SELECT * FROM train_schedules WHERE id = ? AND is_active = TRUE',
      [schedule_id]
    );

    if (schedules.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Train schedule not found.' });
    }

    const schedule = schedules[0];

    // Check seat availability
    if (schedule.available_seats < passenger_count) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'Not enough seats available.',
        error_code: 'SEAT_UNAVAILABLE',
        available: schedule.available_seats
      });
    }

    const totalPrice = schedule.price * passenger_count;
    const bookingCode = generateBookingCode();
    const seatStr = seat_numbers ? seat_numbers.join(',') : null;

    // Create booking
    const [bookingResult] = await conn.execute(
      `INSERT INTO bookings (booking_code, user_id, schedule_id, departure_date, passenger_count, seat_numbers, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [bookingCode, userId, schedule_id, departure_date, passenger_count, seatStr, totalPrice]
    );

    const bookingId = bookingResult.insertId;

    // Insert passengers
    if (passengers && passengers.length > 0) {
      for (const p of passengers) {
        await conn.execute(
          'INSERT INTO passengers (booking_id, full_name, id_number, seat_number) VALUES (?, ?, ?, ?)',
          [bookingId, p.full_name, p.id_number, p.seat_number || null]
        );
      }
    }

    // Update available seats
    await conn.execute(
      'UPDATE train_schedules SET available_seats = available_seats - ? WHERE id = ?',
      [passenger_count, schedule_id]
    );

    // Create payment record
    const paymentCode = `PAY-${Date.now()}`;
    const expiredAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await conn.execute(
      `INSERT INTO payments (payment_code, booking_id, user_id, amount, payment_method, payment_status, expired_at)
       VALUES (?, ?, ?, ?, 'bank_transfer', 'pending', ?)`,
      [paymentCode, bookingId, userId, totalPrice, expiredAt]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: {
        booking_id: bookingId,
        booking_code: bookingCode,
        payment_code: paymentCode,
        total_price: totalPrice,
        expired_at: expiredAt,
        schedule: {
          train_name: schedule.train_name,
          origin_city: schedule.origin_city,
          destination_city: schedule.destination_city,
          departure_time: schedule.departure_time,
          class: schedule.class
        }
      }
    });

  } catch (error) {
    await conn.rollback();
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    conn.release();
  }
};

// GET /api/bookings - Get user's bookings
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        b.*,
        ts.train_name, ts.train_code, ts.origin_city, ts.destination_city,
        ts.departure_time, ts.arrival_time, ts.class,
        p.payment_status, p.payment_method, p.payment_code,
        (SELECT COUNT(*) FROM passengers WHERE booking_id = b.id) AS passenger_count_actual
      FROM bookings b
      JOIN train_schedules ts ON b.schedule_id = ts.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await pool.execute(query, params);

    // Get stats
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END) AS total_spent
       FROM bookings WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: { bookings, stats: stats[0] }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET /api/bookings/:code - Get booking by code
const getBookingByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;

    const [bookings] = await pool.execute(
      `SELECT b.*, ts.train_name, ts.train_code, ts.origin_city, ts.destination_city,
              ts.departure_time, ts.arrival_time, ts.duration_minutes, ts.class, ts.price,
              p.payment_code, p.payment_status, p.payment_method, p.amount, p.paid_at, p.expired_at
       FROM bookings b
       JOIN train_schedules ts ON b.schedule_id = ts.id
       LEFT JOIN payments p ON p.booking_id = b.id
       WHERE b.booking_code = ? AND b.user_id = ?`,
      [code, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    const [passengers] = await pool.execute(
      'SELECT * FROM passengers WHERE booking_id = ?',
      [booking.id]
    );

    return res.status(200).json({
      success: true,
      data: { ...booking, passengers }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// PUT /api/bookings/:code/cancel
const cancelBooking = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { code } = req.params;
    const userId = req.user.id;

    const [bookings] = await conn.execute(
      'SELECT * FROM bookings WHERE booking_code = ? AND user_id = ?',
      [code, userId]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (booking.status === 'cancelled') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    await conn.execute(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [booking.id]
    );

    // Restore seats
    await conn.execute(
      'UPDATE train_schedules SET available_seats = available_seats + ? WHERE id = ?',
      [booking.passenger_count, booking.schedule_id]
    );

    await conn.execute(
      "UPDATE payments SET payment_status = 'failed' WHERE booking_id = ?",
      [booking.id]
    );

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.'
    });

  } catch (error) {
    await conn.rollback();
    console.error('Cancel booking error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    conn.release();
  }
};

module.exports = { createBooking, getMyBookings, getBookingByCode, cancelBooking };

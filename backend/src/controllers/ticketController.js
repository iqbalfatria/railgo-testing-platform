const { pool } = require('../config/database');

// GET /api/tickets - Search train schedules
const getTickets = async (req, res) => {
  try {
    const { origin, destination, date, class: trainClass, sort } = req.query;

    let query;
    const params = [];

    if (date) {
      query = `
        SELECT ts.*, sd.available_seats, (sd.available_seats > 0) AS is_available
        FROM train_schedules ts
        JOIN schedule_dates sd ON ts.id = sd.schedule_id AND sd.travel_date = ?
        WHERE ts.is_active = TRUE
      `;
      params.push(date);
    } else {
      query = `
        SELECT ts.*, (ts.available_seats > 0) AS is_available
        FROM train_schedules ts
        WHERE ts.is_active = TRUE
      `;
    }

    if (origin) {
      query += ' AND ts.origin_city = ?';
      params.push(origin);
    }
    if (destination) {
      query += ' AND ts.destination_city = ?';
      params.push(destination);
    }
    if (trainClass) {
      query += ' AND ts.class = ?';
      params.push(trainClass);
    }

    if (sort === 'price_asc') query += ' ORDER BY ts.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY ts.price DESC';
    else query += ' ORDER BY ts.departure_time ASC';

    const [schedules] = await pool.execute(query, params);

    // Get unique cities for dropdown
    const [cities] = await pool.execute(
      'SELECT DISTINCT origin_city AS city FROM train_schedules UNION SELECT DISTINCT destination_city FROM train_schedules ORDER BY city'
    );

    return res.status(200).json({
      success: true,
      data: {
        schedules,
        cities: cities.map(c => c.city),
        total: schedules.length
      }
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET /api/tickets/:id - Get single schedule
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const [schedules] = await pool.execute(
      'SELECT * FROM train_schedules WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    // Generate seat map
    const schedule = schedules[0];
    const [bookedSeats] = await pool.execute(
      `SELECT seat_numbers FROM bookings 
       WHERE schedule_id = ? AND status != 'cancelled'`,
      [id]
    );

    const takenSeats = [];
    bookedSeats.forEach(b => {
      if (b.seat_numbers) takenSeats.push(...b.seat_numbers.split(','));
    });

    return res.status(200).json({
      success: true,
      data: { ...schedule, taken_seats: takenSeats }
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getTickets, getTicketById };

const { pool } = require('../../src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../../.env' });

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed Users
    const hashedPassword = await bcrypt.hash('RailGo123', 10);
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    await pool.execute(`
      INSERT IGNORE INTO users (full_name, email, phone_number, password, role) VALUES
      ('Test User', 'test@railgo.com', '081234567890', ?, 'user'),
      ('Admin RailGo', 'admin@railgo.com', '081234567891', ?, 'admin'),
      ('Budi Santoso', 'budi@example.com', '081234567892', ?, 'user'),
      ('Siti Rahayu', 'siti@example.com', '081234567893', ?, 'user')
    `, [hashedPassword, adminPassword, hashedPassword, hashedPassword]);

    console.log('✅ Users seeded');

    // Seed Train Schedules
    await pool.execute(`
      INSERT IGNORE INTO train_schedules 
      (train_code, train_name, origin_city, destination_city, departure_time, arrival_time, duration_minutes, class, price, total_seats, available_seats) 
      VALUES
      ('ARG-01', 'Argo Bromo Anggrek', 'Jakarta', 'Surabaya', '08:00:00', '17:30:00', 570, 'Executive', 450000, 50, 42),
      ('ARG-02', 'Argo Bromo Anggrek', 'Jakarta', 'Surabaya', '20:00:00', '05:30:00', 570, 'Executive', 450000, 50, 35),
      ('GBM-01', 'Gajayana', 'Jakarta', 'Malang', '16:00:00', '06:00:00', 840, 'Executive', 520000, 50, 28),
      ('GBM-02', 'Gajayana', 'Jakarta', 'Malang', '09:00:00', '23:00:00', 840, 'Business', 380000, 60, 45),
      ('PAR-01', 'Parahyangan', 'Jakarta', 'Bandung', '07:00:00', '10:30:00', 210, 'Business', 150000, 80, 60),
      ('PAR-02', 'Parahyangan', 'Jakarta', 'Bandung', '09:00:00', '12:30:00', 210, 'Business', 150000, 80, 55),
      ('PAR-03', 'Parahyangan', 'Jakarta', 'Bandung', '11:00:00', '14:30:00', 210, 'Economy', 80000, 100, 80),
      ('PAR-04', 'Parahyangan', 'Bandung', 'Jakarta', '07:00:00', '10:30:00', 210, 'Business', 150000, 80, 72),
      ('SEM-01', 'Sembrani', 'Jakarta', 'Semarang', '06:00:00', '13:00:00', 420, 'Executive', 320000, 50, 30),
      ('SEM-02', 'Sembrani', 'Jakarta', 'Semarang', '18:00:00', '01:00:00', 420, 'Business', 250000, 60, 48),
      ('TAX-01', 'Taksaka', 'Jakarta', 'Yogyakarta', '08:00:00', '16:30:00', 510, 'Executive', 390000, 50, 22),
      ('TAX-02', 'Taksaka', 'Jakarta', 'Yogyakarta', '20:00:00', '04:30:00', 510, 'Executive', 390000, 50, 37),
      ('TAX-03', 'Taksaka', 'Yogyakarta', 'Jakarta', '08:00:00', '16:30:00', 510, 'Business', 290000, 60, 50),
      ('KOM-01', 'Komuter', 'Jakarta', 'Bogor', '06:00:00', '07:30:00', 90, 'Economy', 25000, 150, 130),
      ('KOM-02', 'Komuter', 'Jakarta', 'Bogor', '08:00:00', '09:30:00', 90, 'Economy', 25000, 150, 120),
      ('BIM-01', 'Bima', 'Surabaya', 'Jakarta', '15:00:00', '05:00:00', 840, 'Executive', 470000, 50, 20),
      ('BIM-02', 'Bima', 'Surabaya', 'Jakarta', '07:00:00', '21:00:00', 840, 'Business', 350000, 60, 40)
    `);

    console.log('✅ Train schedules seeded');

    // Seed Sample Bookings
    const bookingCode1 = 'RG-2024-001';
    await pool.execute(`
      INSERT IGNORE INTO bookings (booking_code, user_id, schedule_id, departure_date, passenger_count, seat_numbers, total_price, status)
      VALUES
      (?, 1, 1, '2024-12-25', 1, 'A1', 450000, 'confirmed'),
      ('RG-2024-002', 1, 5, '2024-12-26', 2, 'B2,B3', 300000, 'confirmed'),
      ('RG-2024-003', 3, 11, '2024-12-27', 1, 'C5', 390000, 'pending'),
      ('RG-2024-004', 4, 3, '2024-12-28', 2, 'D1,D2', 1040000, 'cancelled')
    `, [bookingCode1]);

    console.log('✅ Bookings seeded');

    // Seed Passengers
    await pool.execute(`
      INSERT IGNORE INTO passengers (booking_id, full_name, id_number, seat_number)
      VALUES
      (1, 'Test User', '3271234567890001', 'A1'),
      (2, 'Test User', '3271234567890001', 'B2'),
      (2, 'Teman Test', '3271234567890002', 'B3')
    `);

    console.log('✅ Passengers seeded');

    // Seed Payments
    await pool.execute(`
      INSERT IGNORE INTO payments (payment_code, booking_id, user_id, amount, payment_method, payment_status, paid_at)
      VALUES
      ('PAY-2024-001', 1, 1, 450000, 'bank_transfer', 'success', NOW()),
      ('PAY-2024-002', 2, 1, 300000, 'ewallet', 'success', NOW()),
      ('PAY-2024-003', 3, 3, 390000, 'credit_card', 'pending', NULL),
      ('PAY-2024-004', 4, 4, 1040000, 'bank_transfer', 'failed', NULL)
    `);

    console.log('✅ Payments seeded');
    console.log('');
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('📋 Test Credentials:');
    console.log('   Email: test@railgo.com');
    console.log('   Password: RailGo123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();

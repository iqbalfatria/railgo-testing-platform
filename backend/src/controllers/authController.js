const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, confirm_password } = req.body;

    // Validation
    if (!full_name || !email || !phone_number || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
        errors: {
          full_name: !full_name ? 'Full name is required' : null,
          email: !email ? 'Email is required' : null,
          phone_number: !phone_number ? 'Phone number is required' : null,
          password: !password ? 'Password is required' : null,
          confirm_password: !confirm_password ? 'Confirm password is required' : null,
        }
      });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
        errors: { email: 'Please enter a valid email address' }
      });
    }

    // Password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password too short.',
        errors: { password: 'Password must be at least 8 characters' }
      });
    }

    // Confirm password
    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
        errors: { confirm_password: 'Confirm password must match password' }
      });
    }

    // Phone numeric
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number.',
        errors: { phone_number: 'Phone number must contain numbers only' }
      });
    }

    // Check duplicate email
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
        errors: { email: 'This email address is already in use' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, phone_number, password) VALUES (?, ?, ?, ?)',
      [full_name, email, phone_number, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      data: {
        user_id: result.insertId,
        full_name,
        email
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error_code: 'SERVER_ERROR'
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        errors: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
        }
      });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error_code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        error_code: 'ACCOUNT_DEACTIVATED'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error_code: 'INVALID_CREDENTIALS'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error_code: 'SERVER_ERROR'
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, full_name, email, phone_number, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { register, login, getMe };

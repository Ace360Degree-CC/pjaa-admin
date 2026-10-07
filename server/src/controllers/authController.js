import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'pjaa_cms_secret_jwt_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login', details: error.message || String(error) });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already in use by another user' });
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await pool.query('UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?', [name, email, password_hash, userId]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
    }

    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    const updatedUser = users[0];

    const token = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET || 'pjaa_cms_secret_jwt_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message || String(error) });
  }
};

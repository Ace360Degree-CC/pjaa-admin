import pool from '../db/connection.js';

// Public endpoint: Submit new lead / enquiry from website
export const submitEnquiry = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      service_name,
      message,
      source_type,
      form_name,
      cta_name,
      cta_location,
      page_title,
      page_url,
      page_path,
      utm_source,
      utm_medium,
      utm_campaign,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone number are required' });
    }

    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];

    const [result] = await pool.query(
      `INSERT INTO enquiries (
        name, phone, email, service_name, message, source_type, form_name, cta_name, cta_location,
        page_title, page_url, page_path, utm_source, utm_medium, utm_campaign, ip_address, user_agent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone,
        email || null,
        service_name || 'General Inquiry',
        message || null,
        source_type || 'website',
        form_name || 'Quick Lead Form',
        cta_name || 'Submit',
        cta_location || 'unknown',
        page_title || null,
        page_url || null,
        page_path || null,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null,
        ip_address,
        user_agent,
        'new'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. Our expert CA team will contact you shortly.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
};

// Admin endpoint: List all enquiries with search & filter
export const getAllEnquiries = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM enquiries';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR phone LIKE ? OR email LIKE ? OR service_name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [enquiries] = await pool.query(query, params);
    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

// Admin endpoint: Update status or admin notes
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const updates = [];
    const params = [];

    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (admin_notes !== undefined) { updates.push('admin_notes = ?'); params.push(admin_notes); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const [result] = await pool.query(`UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry updated successfully' });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
};

// Admin endpoint: Delete lead
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM enquiries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
};

import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { getAllPages, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/pagesController.js';
import { submitEnquiry, getAllEnquiries, updateEnquiryStatus, deleteEnquiry } from '../controllers/enquiriesController.js';
import { getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blogsController.js';
import { getNavigation, updateNavigation } from '../controllers/navigationController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getMe);

// --- Public Form Endpoint ---
router.post('/enquiries', submitEnquiry);

// --- Public Dynamic Page Fetch ---
router.get('/pages/slug/:slug', getPageBySlug);
router.get('/blogs/slug/:slug', getBlogBySlug);
router.get('/blogs/public', getAllBlogs);
router.get('/navigation/:key', getNavigation);
router.get('/settings/public', getSettings);

// --- Protected Admin Routes ---

// Page Builder CRUD
router.get('/admin/pages', authenticateToken, getAllPages);
router.post('/admin/pages', authenticateToken, createPage);
router.put('/admin/pages/:id', authenticateToken, updatePage);
router.delete('/admin/pages/:id', authenticateToken, deletePage);

// Enquiries / Leads Management
router.get('/admin/enquiries', authenticateToken, getAllEnquiries);
router.patch('/admin/enquiries/:id/status', authenticateToken, updateEnquiryStatus);
router.delete('/admin/enquiries/:id', authenticateToken, deleteEnquiry);

// Blog Management
router.get('/admin/blogs', authenticateToken, getAllBlogs);
router.post('/admin/blogs', authenticateToken, createBlog);
router.put('/admin/blogs/:id', authenticateToken, updateBlog);
router.delete('/admin/blogs/:id', authenticateToken, deleteBlog);

// Navigation & Settings
router.put('/admin/navigation/:key', authenticateToken, updateNavigation);
router.get('/admin/settings', authenticateToken, getSettings);
router.put('/admin/settings', authenticateToken, updateSettings);

export default router;

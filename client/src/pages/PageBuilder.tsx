import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Layers, 
  Globe 
} from 'lucide-react';

interface Block {
  id: string;
  type: 'hero' | 'problems' | 'whatIs' | 'whoFor' | 'benefits' | 'process' | 'documents' | 'trust' | 'faqs' | 'moreKeywords' | 'finalCta' | 'cta';
  data: any;
}

import { isSuperAdmin } from '../utils/auth';

export const PageBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState('published');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew && !isSuperAdmin()) {
      alert('Permission denied: Only Super Admin can create new pages.');
      navigate('/pages');
      return;
    }
    if (!isNew) {
      fetchPageDetails();
    } else {
      setBlocks([
        {
          id: 'b-' + Date.now(),
          type: 'hero',
          data: {
            badge: '⚡ Fast Online CA Service',
            title: 'GST Audit & Compliance Service',
            heroLead: 'Complete GST Return Filing, Notice Resolution, and Annual Audit Support.',
            subtitle: 'Managed directly by qualified Chartered Accountants with 100% Online Processing.',
            primaryCtaText: 'Get Free CA Consultation',
            showForm: true,
          }
        },
        {
          id: 'b-' + (Date.now() + 1),
          type: 'problems',
          data: {
            heading: 'Common GST Issues Business Owners Face:',
            subheading: 'Ignoring GST notices or missing filing deadlines can lead to heavy penalties.',
            items: [
              'Received Mismatch Notice (GSTR-2B vs GSTR-3B)',
              'Cancelled GST Registration Due to Non-Filing',
              'Complex E-Way Bill & E-Invoicing Mismatches'
            ]
          }
        },
        {
          id: 'b-' + (Date.now() + 2),
          type: 'whatIs',
          data: {
            heading: 'What is Included in Our GST Audit Service?',
            points: [
              'Thorough reconciliation of Purchase & Sales registers',
              'Input Tax Credit (ITC) optimization to maximize tax savings',
              'Filing of Form GSTR-9 and GSTR-9C reconciliation statements'
            ],
            note: 'All filings are verified by senior Chartered Accountants before submission.'
          }
        },
        {
          id: 'b-' + (Date.now() + 3),
          type: 'process',
          data: {
            heading: 'OUR 4-STEP PROCESS',
            steps: [
              'Submit Details & Documents',
              'CA Reconciliation & Verification',
              'Draft Review & Client Approval',
              'Official GST Portal Filing'
            ]
          }
        },
        {
          id: 'b-' + (Date.now() + 4),
          type: 'faqs',
          data: {
            heading: 'Frequently Asked Questions',
            faqs: [
              { q: 'Is physical presence required for GST audit?', a: 'No, the entire process is conducted online via digital signature.' },
              { q: 'How fast can a GST notice be responded to?', a: 'Within 24 to 48 hours once all supporting invoices are shared.' }
            ]
          }
        },
        {
          id: 'b-' + (Date.now() + 5),
          type: 'finalCta',
          data: {
            heading: 'Ready to resolve your GST compliance with expert CAs?',
            text: 'Talk to our team today for fast, confidential assistance.',
            buttonText: 'Request Callback'
          }
        }
      ]);
    }
  }, [id]);

  const fetchPageDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/pages`);
      const page = res.data.find((p: any) => String(p.id) === String(id));
      if (page) {
        const detailRes = await api.get(`/pages/slug/${page.slug}`);
        setTitle(detailRes.data.title);
        setSlug(detailRes.data.slug);
        setMetaTitle(detailRes.data.meta_title || detailRes.data.title);
        setMetaDescription(detailRes.data.meta_description || '');
        setStatus(detailRes.data.status || 'published');
        setBlocks(detailRes.data.blocks_json || []);
      }
    } catch (err) {
      console.error('Error fetching page details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNew && !slug) {
      setSlug(newTitle.toLowerCase().trim().replace(/[^a-z0-9-/]/g, '-').replace(/-+/g, '-'));
    }
  };

  const addBlock = (type: Block['type']) => {
    const newId = 'b-' + Date.now();
    let defaultData: any = {};

    if (type === 'hero') {
      defaultData = { badge: '⚡ Service', title: 'Page Title', heroLead: 'Lead explanation', subtitle: 'Sub text', primaryCtaText: 'Request Callback', showForm: true };
    } else if (type === 'problems') {
      defaultData = { heading: 'Common Challenges Owners Face:', items: ['Problem 1', 'Problem 2'] };
    } else if (type === 'whatIs') {
      defaultData = { heading: 'What is Included?', points: ['Point 1', 'Point 2'], note: 'Important note...' };
    } else if (type === 'whoFor') {
      defaultData = { heading: 'WHO SHOULD APPLY?', items: ['Private Limited Companies', 'LLP & Partnerships'] };
    } else if (type === 'benefits') {
      defaultData = { benefitsHeading: 'BENEFITS OF SERVICE', items: ['Benefit 1'], importantHeading: 'IMPORTANT POINTS', important: ['Point 1'] };
    } else if (type === 'process') {
      defaultData = { heading: 'OUR PROCESS', steps: ['Step 1: Submit Details', 'Step 2: CA Review', 'Step 3: Filing'] };
    } else if (type === 'documents') {
      defaultData = { heading: 'DOCUMENTS REQUIRED', items: ['PAN Card & Aadhaar', 'Bank Statements'] };
    } else if (type === 'trust') {
      defaultData = { heading: 'Trusted by Businesses', reviews: ['Great CA service!', 'Quick resolution.'] };
    } else if (type === 'faqs') {
      defaultData = { heading: 'Frequently Asked Questions', faqs: [{ q: 'Question?', a: 'Answer.' }] };
    } else if (type === 'moreKeywords') {
      defaultData = { title: 'Related Topics & Keywords', keywords: ['GST Return', 'CA Audit', 'Tax Notice'] };
    } else if (type === 'finalCta' || type === 'cta') {
      defaultData = { heading: 'Ready to proceed?', text: 'Contact our CA team today.', buttonText: 'Request Callback' };
    }

    setBlocks([...blocks, { id: newId, type, data: defaultData }]);
  };

  const updateBlockData = (blockId: string, newData: any) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, data: newData } : b)));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setBlocks(updated);
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const handleSave = async () => {
    if (!title || !slug) {
      alert('Please fill in Page Title and URL Slug.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        meta_title: metaTitle || title,
        meta_description: metaDescription,
        status,
        blocks,
      };

      if (isNew) {
        await api.post('/admin/pages', payload);
      } else {
        await api.put(`/admin/pages/${id}`, payload);
      }

      alert('Page saved successfully!');
      navigate('/pages');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading Page Builder...</div>;
  }

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/pages')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isNew ? 'Create New Page' : `Edit: ${title}`}</h1>
            <p className="text-xs text-red-600 font-mono font-semibold">/{slug || 'url-slug'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-800 px-3 py-2.5 rounded-xl outline-none shadow-xs"
          >
            <option value="published">🟢 Published</option>
            <option value="draft">🟡 Draft</option>
          </select>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Publish Page'}</span>
          </button>
        </div>
      </div>

      {/* Page Metadata Settings / Page Name */}
      {isSuperAdmin() ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-red-600" />
            <span>SEO & Page Settings</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. GST Audit & Notice Resolution"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. gst-audit-guidance"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-red-600 font-mono font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Google Search Title"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Meta Description</label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Search description snippet..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Page Name</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{title || 'Untitled Page'}</h2>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">/{slug}</span>
        </div>
      )}

      {/* Block Selector Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-red-600" />
          <span>Add Section Block:</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => addBlock('hero')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>1. Hero Section</span>
          </button>
          <button onClick={() => addBlock('problems')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>2. Problems Cards</span>
          </button>
          <button onClick={() => addBlock('whatIs')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>3. Overview & Points</span>
          </button>
          <button onClick={() => addBlock('whoFor')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>4. Who Should Apply</span>
          </button>
          <button onClick={() => addBlock('benefits')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>5. Benefits & Notes</span>
          </button>
          <button onClick={() => addBlock('process')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>6. Process Steps</span>
          </button>
          <button onClick={() => addBlock('documents')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>7. Documents Required</span>
          </button>
          <button onClick={() => addBlock('trust')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>8. Client Reviews</span>
          </button>
          <button onClick={() => addBlock('faqs')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>9. FAQs</span>
          </button>
          <button onClick={() => addBlock('moreKeywords')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>10. Topics / Tags</span>
          </button>
          <button onClick={() => addBlock('finalCta')} className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5 text-red-600" />
            <span>11. Final Call-to-Action</span>
          </button>
        </div>
      </div>

      {/* Rendered Block Forms */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-red-50 text-red-600 text-[10px] flex items-center justify-center font-bold border border-red-200">
                  {index + 1}
                </span>
                <span>{block.type.toUpperCase()} SECTION BLOCK</span>
              </span>

              <div className="flex items-center space-x-1">
                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer">
                  <MoveUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer">
                  <MoveDown className="w-4 h-4" />
                </button>
                <button onClick={() => removeBlock(block.id)} className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* HERO BLOCK */}
            {block.type === 'hero' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Badge Tagline</label>
                    <input
                      type="text"
                      value={block.data.badge || ''}
                      onChange={(e) => updateBlockData(block.id, { ...block.data, badge: e.target.value })}
                      placeholder="e.g. GST · Registration & Audit"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={block.data.primaryCtaText || ''}
                      onChange={(e) => updateBlockData(block.id, { ...block.data, primaryCtaText: e.target.value })}
                      placeholder="e.g. Request Callback"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Main Heading (H1)</label>
                  <input
                    type="text"
                    value={block.data.title || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, title: e.target.value })}
                    placeholder="Headline"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Hero Lead Description</label>
                  <input
                    type="text"
                    value={block.data.heroLead || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, heroLead: e.target.value })}
                    placeholder="Short introduction paragraph..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>
              </div>
            )}

            {/* PROBLEMS BLOCK */}
            {block.type === 'problems' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Section Heading</label>
                  <input
                    type="text"
                    value={block.data.heading || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, heading: e.target.value })}
                    placeholder="e.g. Common Problems Business Owners Face:"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-red-600">Problem Items List</label>
                  {(block.data.items || []).map((item: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...block.data.items];
                          updated[i] = e.target.value;
                          updateBlockData(block.id, { ...block.data, items: updated });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = block.data.items.filter((_: any, idx: number) => idx !== i);
                          updateBlockData(block.id, { ...block.data, items: updated });
                        }}
                        className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(block.data.items || []), 'New Problem Point'];
                      updateBlockData(block.id, { ...block.data, items: updated });
                    }}
                    className="text-red-600 hover:underline text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Problem Point</span>
                  </button>
                </div>
              </div>
            )}

            {/* WHAT IS BLOCK */}
            {block.type === 'whatIs' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Section Heading</label>
                  <input
                    type="text"
                    value={block.data.heading || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, heading: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-red-600">Key Points (With Checkmarks)</label>
                  {(block.data.points || []).map((point: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const updated = [...block.data.points];
                          updated[i] = e.target.value;
                          updateBlockData(block.id, { ...block.data, points: updated });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = block.data.points.filter((_: any, idx: number) => idx !== i);
                          updateBlockData(block.id, { ...block.data, points: updated });
                        }}
                        className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(block.data.points || []), 'New Overview Point'];
                      updateBlockData(block.id, { ...block.data, points: updated });
                    }}
                    className="text-red-600 hover:underline text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Key Point</span>
                  </button>
                </div>
              </div>
            )}

            {/* PROCESS STEPS BLOCK */}
            {block.type === 'process' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Section Heading</label>
                  <input
                    type="text"
                    value={block.data.heading || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, heading: e.target.value })}
                    placeholder="OUR PROCESS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-red-600">Sequential Process Steps</label>
                  {(block.data.steps || []).map((step: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="w-6 text-center font-bold text-red-600">{i + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...block.data.steps];
                          updated[i] = e.target.value;
                          updateBlockData(block.id, { ...block.data, steps: updated });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = block.data.steps.filter((_: any, idx: number) => idx !== i);
                          updateBlockData(block.id, { ...block.data, steps: updated });
                        }}
                        className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(block.data.steps || []), 'Next Step Description'];
                      updateBlockData(block.id, { ...block.data, steps: updated });
                    }}
                    className="text-red-600 hover:underline text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>
              </div>
            )}

            {/* FAQS BLOCK */}
            {block.type === 'faqs' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Section Heading</label>
                  <input
                    type="text"
                    value={block.data.heading || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, heading: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-red-600">Questions & Answers</label>
                  {(block.data.faqs || []).map((faq: any, i: number) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500">FAQ #{i + 1}</span>
                        <button
                          onClick={() => {
                            const updated = block.data.faqs.filter((_: any, idx: number) => idx !== i);
                            updateBlockData(block.id, { ...block.data, faqs: updated });
                          }}
                          className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Question?"
                        value={faq.q}
                        onChange={(e) => {
                          const updated = [...block.data.faqs];
                          updated[i].q = e.target.value;
                          updateBlockData(block.id, { ...block.data, faqs: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-semibold outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="Answer explanation..."
                        value={faq.a}
                        onChange={(e) => {
                          const updated = [...block.data.faqs];
                          updated[i].a = e.target.value;
                          updateBlockData(block.id, { ...block.data, faqs: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const updated = [...(block.data.faqs || []), { q: 'Question text?', a: 'Answer text.' }];
                      updateBlockData(block.id, { ...block.data, faqs: updated });
                    }}
                    className="text-red-600 hover:underline text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question & Answer</span>
                  </button>
                </div>
              </div>
            )}

            {/* FINAL CTA BLOCK */}
            {(block.type === 'finalCta' || block.type === 'cta') && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">CTA Headline</label>
                  <input
                    type="text"
                    value={block.data.heading || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, heading: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Subheading / Supporting Text</label>
                  <input
                    type="text"
                    value={block.data.text || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Primary Button Label</label>
                  <input
                    type="text"
                    value={block.data.buttonText || ''}
                    onChange={(e) => updateBlockData(block.id, { ...block.data, buttonText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

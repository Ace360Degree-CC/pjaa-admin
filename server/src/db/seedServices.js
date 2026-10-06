import pool from './connection.js';

// Helper to convert any static service object into standard CMS Block JSON
export function convertServiceToCMSBlocks(s) {
  const blocks = [];

  // 1. Hero Block
  blocks.push({
    id: 'b-hero-' + s.slug,
    type: 'hero',
    data: {
      badge: s.badge || '⚡ Fast Online CA Service',
      title: s.h1 || s.title,
      heroLead: s.heroLead || '',
      subtitle: s.heroSub || '',
      primaryCtaText: s.primaryCta || 'Request Callback',
      showForm: true,
    }
  });

  // 2. Problems Block
  if (s.problems && s.problems.length > 0) {
    blocks.push({
      id: 'b-problems-' + s.slug,
      type: 'problems',
      data: {
        heading: s.problemsHeading || 'Common Problems Business Owners Face:',
        subheading: s.problemsIntro || '',
        items: s.problems,
      }
    });
  }

  // 3. WhatIs / Overview Block
  if (s.whatIs && s.whatIs.points) {
    blocks.push({
      id: 'b-whatIs-' + s.slug,
      type: 'whatIs',
      data: {
        heading: s.whatIs.heading || 'Overview & Key Provisions',
        points: s.whatIs.points || [],
        note: s.whatIs.note || '',
      }
    });
  }

  // 4. WhoFor Block
  if (s.whoFor && s.whoFor.length > 0) {
    blocks.push({
      id: 'b-whoFor-' + s.slug,
      type: 'whoFor',
      data: {
        heading: s.whoForHeading || 'WHO SHOULD APPLY?',
        items: s.whoFor,
      }
    });
  }

  // 5. Benefits Block
  if ((s.benefits && s.benefits.length > 0) || (s.important && s.important.length > 0)) {
    blocks.push({
      id: 'b-benefits-' + s.slug,
      type: 'benefits',
      data: {
        benefitsHeading: s.benefitsHeading || 'BENEFITS OF THIS SERVICE',
        items: s.benefits || [],
        importantHeading: s.importantHeading || 'IMPORTANT POINTS',
        important: s.important || [],
      }
    });
  }

  // 6. Process Block
  if (s.process && s.process.length > 0) {
    blocks.push({
      id: 'b-process-' + s.slug,
      type: 'process',
      data: {
        heading: s.processHeading || 'OUR PROCESS',
        steps: s.process,
      }
    });
  }

  // 7. Documents Block
  if (s.documents && s.documents.length > 0) {
    blocks.push({
      id: 'b-documents-' + s.slug,
      type: 'documents',
      data: {
        heading: s.documentsHeading || 'DOCUMENTS REQUIRED',
        items: s.documents,
      }
    });
  }

  // 8. Trust Block
  if (s.trustQuotes && s.trustQuotes.length > 0) {
    blocks.push({
      id: 'b-trust-' + s.slug,
      type: 'trust',
      data: {
        heading: s.trustHeading || 'Trusted by Businesses Across India',
        reviews: s.trustQuotes,
      }
    });
  }

  // 9. FAQ Block
  if (s.faqs && s.faqs.length > 0) {
    blocks.push({
      id: 'b-faqs-' + s.slug,
      type: 'faqs',
      data: {
        heading: s.faqHeading || 'Frequently Asked Questions',
        faqs: s.faqs,
      }
    });
  }

  // 10. More Keywords Block
  if (s.moreKeywords && s.moreKeywords.length > 0) {
    blocks.push({
      id: 'b-keywords-' + s.slug,
      type: 'moreKeywords',
      data: {
        title: s.moreHeading || 'Related Topics & Keywords',
        keywords: s.moreKeywords,
      }
    });
  }

  // 11. Final CTA Block
  blocks.push({
    id: 'b-finalCta-' + s.slug,
    type: 'finalCta',
    data: {
      heading: s.finalCtaHeading || 'Ready to get started with expert CA assistance?',
      text: s.finalCtaSubheading || 'Get complete guidance and stress-free compliance.',
      buttonText: s.finalCtaPrimary || s.primaryCta || 'Request Callback',
    }
  });

  return blocks;
}

export async function seedSinglePage(s, categoryName = 'General') {
  const blocks = convertServiceToCMSBlocks(s);
  const blocksJson = JSON.stringify(blocks);

  const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [s.slug]);
  if (existing.length === 0) {
    await pool.query(
      `INSERT INTO pages (title, slug, meta_title, meta_description, status, template, blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        s.title,
        s.slug,
        s.metaTitle || s.title,
        s.metaDescription || '',
        'published',
        categoryName,
        blocksJson,
      ]
    );
    return true;
  }
  return false;
}

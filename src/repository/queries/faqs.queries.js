module.exports = {
  CREATE_FAQ: `
    INSERT INTO faqs (faq_uuid, question, answer, category, is_published)
    VALUES (?, ?, ?, ?, ?)
  `,

  GET_ALL_FAQS: `
    SELECT faq_id, faq_uuid, question, answer, category, is_published, created_at, updated_at, COUNT(*) OVER() AS totalRows
    FROM faqs
    ORDER BY created_at DESC
    LIMIT ?,?
  `,

  COUNT_FAQ: `
    SELECT COUNT(*) AS totalRows FROM faqs;
  `,

  GET_PUBLISHED_FAQS: `
    SELECT faq_id, faq_uuid, question, answer, category, is_published, created_at, updated_at, COUNT(*) OVER() AS totalRows
    FROM faqs
    WHERE is_published = 1
    ORDER BY created_at DESC
    LIMIT ?,?
  `,

  COUNT_PUBLISHED_FAQ: `
    SELECT COUNT(*) AS totalRows FROM faqs WHERE is_published = 1;
  `,

  GET_FAQ_BY_ID: `
    SELECT faq_id, faq_uuid, question, answer, category, is_published, created_at, updated_at
    FROM faqs
    WHERE faq_id = ?
  `,

  GET_FAQ_BY_UUID: `
    SELECT faq_id, faq_uuid, question, answer, category, is_published, created_at, updated_at
    FROM faqs
    WHERE faq_uuid = ?
  `,

  UPDATE_FAQ: `
    UPDATE faqs
    SET question = ?, answer = ?, category = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE faq_uuid = ?
  `,

  DELETE_FAQ: `
    DELETE FROM faqs
    WHERE faq_uuid = ?
  `,

  PUBLISH_FAQ: `
    UPDATE faqs
    SET is_published = 1, updated_at = CURRENT_TIMESTAMP
    WHERE faq_uuid = ?
  `,

  UNPUBLISH_FAQ: `
    UPDATE faqs
    SET is_published = 0, updated_at = CURRENT_TIMESTAMP
    WHERE faq_uuid = ?
  `,
};

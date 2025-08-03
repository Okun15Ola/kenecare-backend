module.exports = {
  CREATE_BLOG: `
    INSERT INTO doctor_health_blogs (
      blog_uuid, doctor_id, title, content,
      image, tags, status, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,

  GET_BLOG_BY_UUID: `
    SELECT 
      blog_uuid, doctor_id, title, content, 
      status, image, tags, created_at, 
      published_at, updated_at
    FROM doctor_health_blogs
    WHERE blog_uuid = ?
  `,

  GET_BLOGS_BY_DOCTOR_ID: `
    SELECT 
      blog_uuid, doctor_id, title, content, 
      status, image, tags, created_at, 
      published_at, updated_at
    FROM doctor_health_blogs
    WHERE doctor_id = ?
    ORDER BY created_at DESC
  `,

  GET_PUBLISHED_BLOGS_BY_DOCTOR: `
    SELECT 
      blog_uuid, doctor_id, title, content, 
      status, image, tags, created_at, 
      published_at, updated_at
    FROM doctor_health_blogs
    WHERE doctor_id = ? AND status = 'published'
    ORDER BY published_at DESC
  `,

  UPDATE_BLOG: `
    UPDATE doctor_health_blogs
    SET 
      title = ?,
      content = ?,
      image = ?,
      tags = ?,
      status = ?,
      published_at = ?
    WHERE doctor_id = ? AND blog_uuid = ?;
  `,

  PUBLISH_BLOG: `
    UPDATE doctor_health_blogs
    SET 
      status = 'published',
      published_at = CURRENT_TIMESTAMP
    WHERE doctor_id = ? AND blog_uuid = ?;
  `,

  ARCHIVE_BLOG: `
    UPDATE doctor_health_blogs
    SET status = 'archived', published_at = null
    WHERE doctor_id = ? AND blog_uuid = ?;
  `,

  PUBLISH_SCHEDULED_BLOGS: `
  UPDATE doctor_health_blogs
  SET 
    status = 'published'
  WHERE status = 'scheduled'
  AND published_at <= NOW()
`,

  DELETE_BLOG: `
    DELETE FROM doctor_health_blogs
    WHERE doctor_id = ? AND blog_uuid = ?;
  `,
};

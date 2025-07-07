module.exports = {
  GET_ALL_BLOG: `
    SELECT blog_id, category_name, title, description, image, tags, disclaimer, fullname as 'author', blogs.is_active, blogs.is_featured, blogs.created_at
    FROM blogs
    INNER JOIN blog_categories ON blogs.blog_category_id = blog_categories.category_id
    INNER JOIN admins on blogs.inputted_by = admins.admin_id
  `,
  GET_BLOG_BY_ID: `
    SELECT blog_id, category_name, title, description, image, tags, disclaimer, fullname as 'author', blogs.is_active, blogs.is_featured, blogs.created_at
    FROM blogs
    INNER JOIN blog_categories ON blogs.blog_category_id = blog_categories.category_id
    INNER JOIN admins on blogs.inputted_by = admins.admin_id
    WHERE blog_id = ? LIMIT 1;
  `,
  CREATE_BLOG: `
    INSERT INTO blogs (blog_category_id, title, description, image, tags, is_featured, inputted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  UPDATE_BLOG_BY_ID: `
    UPDATE blogs SET blog_category_id = ?, title = ?, description = ?, image = ?, tags = ?, is_featured = ? WHERE blog_id = ?
  `,
  UPDATE_BLOG_STATUS_BY_ID: `
    UPDATE blogs SET is_active = ? WHERE blog_id = ?
  `,
  UPDATE_BLOG_FEATURED_BY_ID: `
    UPDATE blogs SET is_featured = ? WHERE blog_id = ?
  `,
  DELETE_BLOG_BY_ID: `
    DELETE FROM blogs WHERE blog_id = ?
  `,
};

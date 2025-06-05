const { query } = require("./db.connection");
const queries = require("./queries/faqs.queries");

exports.getAllFaqs = async () => {
  return query(queries.GET_ALL_FAQS);
};

exports.getFaqById = async (id) => {
  const result = await query(queries.GET_FAQ_BY_ID, [id]);
  return result[0];
};

exports.createNewFaq = async (blog) => {
  const { category, title, content, image, tags, featured, inputtedBy } = blog;
  return query(queries.CREATE_FAQ, [
    category,
    title,
    content,
    image,
    tags,
    featured,
    inputtedBy,
  ]);
};

exports.updateFaqById = async ({ id, blog }) => {
  const { category, title, content, image, tags, featured } = blog;
  return query(queries.UPDATE_FAQ_BY_ID, [
    category,
    title,
    content,
    image,
    tags,
    featured,
    id,
  ]);
};

exports.updateFaqStatusById = async ({ id, status }) => {
  return query(queries.UPDATE_FAQ_STATUS_BY_ID, [status, id]);
};

exports.deleteFaqById = async (id) => {
  return query(queries.DELETE_FAQ_BY_ID, [id]);
};

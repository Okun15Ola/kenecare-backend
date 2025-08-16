const { query } = require("./db.connection");
const queries = require("./queries/faqs.queries");

exports.getAllFaqs = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_FAQS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getPublishedFaqs = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_PUBLISHED_FAQS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.countPublishFaq = async () => {
  const result = await query(queries.COUNT_PUBLISHED_FAQ);
  return result[0];
};

exports.countFaq = async () => {
  const result = await query(queries.COUNT_FAQ);
  return result[0];
};

exports.getFaqById = async (faqId) => {
  const result = await query(queries.GET_FAQ_BY_ID, [faqId]);
  return result[0];
};

exports.getFaqByUuid = async (faqUuid) => {
  const result = await query(queries.GET_FAQ_BY_UUID, [faqUuid]);
  return result[0];
};

exports.createNewFaq = async ({
  faqUuid,
  question,
  answer,
  category,
  isPublished = 0,
}) => {
  return query(queries.CREATE_FAQ, [
    faqUuid,
    question,
    answer,
    category,
    isPublished,
  ]);
};

exports.updateFaqByUuid = async ({
  faqUuid,
  question,
  answer,
  category,
  isPublished = 0,
}) => {
  return query(queries.UPDATE_FAQ, [
    question,
    answer,
    category,
    isPublished,
    faqUuid,
  ]);
};

exports.publishFaq = async (faqUuid) => {
  return query(queries.PUBLISH_FAQ, [faqUuid]);
};

exports.unpublishFaq = async (faqUuid) => {
  return query(queries.UNPUBLISH_FAQ, [faqUuid]);
};

exports.deleteFaqByUuid = async (faqUuid) => {
  return query(queries.DELETE_FAQ, [faqUuid]);
};

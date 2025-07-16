module.exports = {
  getAllFaqs: jest.fn(),
  getFaqById: jest.fn(),
  createNewFaq: jest.fn().mockResolvedValue({ insertId: 1 }),
  updateFaqById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
  updateFaqStatusById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
  deleteFaqById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
};

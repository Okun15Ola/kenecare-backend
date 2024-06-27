const { connectionPool } = require("../db/db.connection");

const executeQuery = (sql) =>
  new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
const calculatePaginationInfo = (tableName) => async (req, res, next) => {
  try {
    const page = req.query.page ? req.query.page : 2;
    const limit = req.query.limit ? req.query.limit : 10;

    const sql = `SELECT COUNT(*) as total_rows FROM ${tableName}`;

    const results = await executeQuery(sql);
    if (results) {
      const { total_rows: totalRows } = results[0];
      const totalPages = Math.ceil(totalRows / limit);

      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const nextPage = hasNextPage ? { page: page + 1, limit } : null;
      const previousPage = hasPreviousPage ? { page: page - 1, limit } : null;

      req.paginationInfo = {
        totalPages,
        nextPage,
        previousPage,
      };

      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  calculatePaginationInfo,
};

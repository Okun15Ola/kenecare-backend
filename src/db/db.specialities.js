const { connectionPool } = require("./db.connection");

exports.getAllDepartmentTypes = () => {
  const sql = "SELECT * FROM department_type ORDER BY id DESC";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getDepartmentTypeById = (departmentTypeId) => {
  const sql = "SELECT * FROM department_type WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [departmentTypeId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.createNewDepartmentType = (departmentType) => {
  const { departmentTypeName, image, description } = departmentType;
  const sql =
    "INSERT INTO department_type (name, description, image) VALUES (?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [departmentTypeName, description, image],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateDepartmentTypeById = (
  departmentTypeId,
  updatedDepartmentType
) => {
  const { departmentTypeName, image, description } = updatedDepartmentType;
  const sql =
    "UPDATE degree SET name = ?, description = ?, image = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [departmentTypeName, image, description, departmentTypeId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.deleteDepartmentTypeById = (departmentTypeId) => {
  const sql = "DELETE FROM department_type WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [departmentTypeId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

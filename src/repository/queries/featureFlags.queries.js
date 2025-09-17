module.exports = {
  CREATE_FEATURE_FLAG: `
    INSERT INTO feature_flags
      (flag_uuid, flag_name, description, is_enabled, rollout_percentage)
    VALUES (?, ?, ?, ?, ?);
  `,

  GET_ALL_FEATURE_FLAGS: `
    SELECT flag_uuid, flag_name, description, is_enabled, rollout_percentage, created_at, updated_at
    FROM feature_flags
    ORDER BY created_at DESC;
  `,

  GET_FEATURE_FLAG_BY_NAME: `
    SELECT flag_uuid, flag_name, description, is_enabled, rollout_percentage, created_at, updated_at
    FROM feature_flags
    WHERE flag_name = ?;
  `,

  UPDATE_FEATURE_FLAG_BY_NAME: `
    UPDATE feature_flags
    SET description = ?, is_enabled = ?, rollout_percentage = ?
    WHERE flag_name = ?;
  `,

  TOGGLE_FEATURE_FLAG_STATUS: `
    UPDATE feature_flags
    SET is_enabled = ?
    WHERE flag_name = ?;
  `,

  UPDATE_ROLL_OUT_PERCENTAGE: `
    UPDATE feature_flags
    SET rollout_percentage = ?
    WHERE flag_name = ?;
  `,

  DELETE_FEATURE_FLAG: `
    DELETE FROM feature_flags
    WHERE flag_name = ?;
  `,
};

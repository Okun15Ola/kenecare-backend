module.exports = {
  // INSERT queries
  INSERT_SINGLE_DAY: `
    INSERT INTO doctor_available_days (doctor_id, day_of_week, day_start_time, day_end_time, is_available)
    VALUES (?, ?, ?, ?, ?)
  `,

  INSERT_MULTIPLE_DAYS: `
    INSERT INTO doctor_available_days (doctor_id, day_of_week, day_start_time, day_end_time, is_available)
    VALUES ?
  `,

  // SELECT queries
  SELECT_AVAILABLE_DAYS_FOR_DOCTOR: `
    SELECT day_slot_id, day_of_week, day_start_time, day_end_time, is_available
    FROM doctor_available_days
    WHERE doctor_id = ? AND is_available = 1
    ORDER BY 
      CASE day_of_week 
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 7
      END
  `,

  SELECT_SPECIFIC_DAY_AVAILABILITY: `
    SELECT day_slot_id, day_start_time, day_end_time, is_available
    FROM doctor_available_days
    WHERE doctor_id = ? AND day_of_week = ?;
  `,

  SELECT_DOCTORS_AVAILABLE_ON_DAY: `
    SELECT d.doctor_id, d.day_of_week, d.day_start_time, d.day_end_time
    FROM doctor_available_days d
    WHERE d.day_of_week = ? AND d.is_available = 1;
  `,

  // UPDATE queries
  UPDATE_WORKING_HOURS: `
    UPDATE doctor_available_days 
    SET day_start_time = ?, 
        day_end_time = ?
    WHERE doctor_id = ? AND day_of_week = ?;
  `,

  UPSERT_WEEKEND_AVAILABILITY: `
    INSERT INTO doctor_available_days (doctor_id, day_of_week, day_start_time, day_end_time, is_available)
    VALUES 
      (?, 'saturday', ?, ?, ?),
      (?, 'sunday', ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      day_start_time = VALUES(day_start_time),
      day_end_time = VALUES(day_end_time),
      is_available = VALUES(is_available);
  `,

  UPDATE_TOGGLE_AVAILABILITY: `
    UPDATE doctor_available_days 
    SET is_available = ?
    WHERE doctor_id = ? AND day_of_week = ?;
  `,

  UPDATE_BULK_WEEKDAY_HOURS: `
    UPDATE doctor_available_days 
    SET day_start_time = ?,
        day_end_time = ?
    WHERE doctor_id = ? AND day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
  `,

  // DELETE queries
  DELETE_SPECIFIC_DAY: `
    DELETE FROM doctor_available_days 
    WHERE doctor_id = ? AND day_of_week = ?;
  `,

  DELETE_ALL_DOCTOR_AVAILABILITY: `
    DELETE FROM doctor_available_days 
    WHERE doctor_id = ?;
  `,
};

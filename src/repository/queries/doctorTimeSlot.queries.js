module.exports = {
  CREATE_DOCTOR_TIME_SLOT: `
    INSERT INTO doctor_time_slots (doctor_id, day_slot_id, slot_start_time, slot_end_time, is_slot_available)
    VALUES (?, ?, ?, ?, ?);
  `,
  BULK_INSERT_DOCTOR_TIME_SLOTS: `
    INSERT INTO doctor_time_slots (doctor_id, day_slot_id, slot_start_time, slot_end_time, is_slot_available)
    VALUES ?;
  `,
  GET_AVAILABLE_SLOTS_FOR_DAY: `
    SELECT ts.time_slot_id, ts.slot_start_time, ts.slot_end_time, ts.is_slot_available, dad.day_of_week
    FROM doctor_time_slots ts
    JOIN doctor_available_days dad ON ts.day_slot_id = dad.day_slot_id
    WHERE ts.doctor_id = ? AND dad.day_of_week = ? AND ts.is_slot_available = 1
    ORDER BY ts.slot_start_time;
  `,
  GET_AVAILABLE_SLOTS_FOR_WEEK: `
    SELECT ts.time_slot_id, dad.day_of_week, ts.slot_start_time, ts.slot_end_time
    FROM doctor_time_slots ts
    JOIN doctor_available_days dad ON ts.day_slot_id = dad.day_slot_id
    WHERE ts.doctor_id = ? 
      AND ts.is_slot_available = 1
      AND dad.is_available = 1
    ORDER BY 
      CASE dad.day_of_week 
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 7
      END, ts.slot_start_time;
  `,
  GET_BOOKED_SLOTS: `
    SELECT ts.time_slot_id, dad.day_of_week, ts.slot_start_time, ts.slot_end_time
    FROM doctor_time_slots ts
    JOIN doctor_available_days dad ON ts.day_slot_id = dad.day_slot_id
    WHERE ts.doctor_id = ? AND ts.is_slot_available = 0
    ORDER BY dad.day_of_week, ts.slot_start_time;
  `,
  MARK_SLOT_UNAVAILABLE: `
    UPDATE doctor_time_slots 
    SET is_slot_available = 0
    WHERE time_slot_id = ?  AND doctor_id = ?;
  `,
  MARK_SLOT_AVAILABLE: `
    UPDATE doctor_time_slots 
    SET is_slot_available = 1
    WHERE time_slot_id = ? AND doctor_id = ?;
  `,
  UPDATE_SLOT_TIMING: `
    UPDATE doctor_time_slots 
    SET slot_start_time = ?, slot_end_time = ?
    WHERE time_slot_id = ? AND doctor_id = ?;
  `,
  BULK_MARK_DAY_UNAVAILABLE: `
    UPDATE doctor_time_slots ts
    JOIN doctor_available_days dad ON ts.day_slot_id = dad.day_slot_id
    SET ts.is_slot_available = 0
    WHERE ts.doctor_id = ? AND dad.day_of_week = ?;
  `,
  DELETE_TIME_SLOT: `
    DELETE FROM doctor_time_slots WHERE time_slot_id = ?;
  `,
  DELETE_SLOTS_FOR_DAY: `
    DELETE ts FROM doctor_time_slots ts
    JOIN doctor_available_days dad ON ts.day_slot_id = dad.day_slot_id
    WHERE ts.doctor_id = ? AND dad.day_of_week = ?;
  `,
  DELETE_SLOTS_FOR_DOCTOR: `
    DELETE FROM doctor_time_slots WHERE doctor_id = ?;
  `,
};

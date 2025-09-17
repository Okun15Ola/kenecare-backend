module.exports = {
  CREATE_ZOOM_MEETING: `
    INSERT INTO zoom_meetings (zoom_id, zoom_uuid, meeting_topic, join_url, start_url, encrypted_password)
    VALUES (?, ?, ?, ?, ?, ?);
  `,
  GET_ZOOM_MEETING_BY_ID: `
    SELECT * FROM zoom_meetings WHERE zoom_id = ? LIMIT 1;
  `,
  GET_ALL_ZOOM_MEETINGS: `
  SELECT * FROM zoom_meetings;
  `,
};

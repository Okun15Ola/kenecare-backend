const { connectionPool } = require("./db.connection");

exports.createNewZoomMeeting = ({
  meetingId,
  meetingUUID,
  meetingTopic,
  joinUrl,
  startUrl,
  encryptedPassword,
}) => {
  const sql =
    "INSERT INTO zoom_meetings (zoom_id, zoom_uuid, meeting_topic, join_url,start_url,encrypted_password) VALUES (?,?,?,?,?,?);";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        meetingId,
        meetingUUID,
        meetingTopic,
        joinUrl,
        startUrl,
        encryptedPassword,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.getZoomMeetings = ({
  meetingId,
  meetingUUID,
  meetingTopic,
  joinUrl,
  startUrl,
  encryptedPassword,
}) => {
  const sql =
    "INSERT INTO zoom_meetings (zoom_id, zoom_uuid, meeting_topic, join_url,start_url,encrypted_password) VALUES (?,?,?,?,?,?);";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        meetingId,
        meetingUUID,
        meetingTopic,
        joinUrl,
        startUrl,
        encryptedPassword,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.getZoomMeetingByZoomId = (meetingId) => {
  const sql = "SELECT * FROM zoom_meetings WHERE zoom_id = ? LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [meetingId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

const { query } = require("./db.connection");
const queries = require("./queries/zoomMeetings.queries");

exports.createNewZoomMeeting = async ({
  meetingId,
  meetingUUID,
  meetingTopic,
  joinUrl,
  startUrl,
  encryptedPassword,
}) => {
  return query(queries.CREATE_ZOOM_MEETING, [
    meetingId,
    meetingUUID,
    meetingTopic,
    joinUrl,
    startUrl,
    encryptedPassword,
  ]);
};

exports.getZoomMeetings = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_ZOOM_MEETINGS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getZoomMeetingByZoomId = async (meetingId) => {
  const result = await query(queries.GET_ZOOM_MEETING_BY_ID, [meetingId]);
  return result[0];
};

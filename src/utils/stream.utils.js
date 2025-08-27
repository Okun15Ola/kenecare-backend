const { StreamClient } = require("@stream-io/node-sdk");
const logger = require("../middlewares/logger.middleware");

const {
  streamSdkApiKey,
  streamSdkApiSecret,
} = require("../config/default.config");

const client = new StreamClient(streamSdkApiKey, streamSdkApiSecret, {
  timeout: 50000,
});

const generateStreamUserToken = async (userId) => {
  try {
    const tokenValidity = 24 * 60 * 60;
    return client.generateUserToken({
      user_id: userId,
      validity_in_seconds: tokenValidity,
    });
  } catch (error) {
    logger.error("Stream Error: ", error);
    throw error;
  }
};

const createOrUpdateStreamUser = async ({
  userId,
  userType,
  mobileNumber,
  username,
  image,
}) => {
  try {
    const user = {
      id: userId,
      role: userType === 1 ? "user" : "host",
      custom: {
        mobileNumber,
      },
      name: username,
      image,
    };
    await client.upsertUsers([user]);
  } catch (error) {
    logger.error("Stream Error: ", error);
    throw error;
  }
};

const createStreamCall = async (call) => {
  try {
    if (!call || !call.callType || !call.callID || !call.userId) {
      throw new Error("Invalid call parameters");
    }
    const { callType, callID, userId, appointmentId, members } = call;
    const streamCall = client.video.call(callType, callID);
    const response = await streamCall.getOrCreate({
      members_limit: members?.length || 2,
      // Ring and Notify cannot be both true
      // notify: true,
      ring: true,
      video: true,
      data: {
        members,
        created_by_id: userId.toString(),
        custom: {
          appointmentId,
        },
        settings_override: {
          limits: {
            max_duration_seconds: 1800,
          },
        },
      },
    });
    return response;
  } catch (error) {
    logger.error("CREATE_STREAM_CALL_ERROR: ", error);
    console.error("CREATE_STREAM_CALL_ERROR: ", error);
    throw error;
  }
};

const endStreamCall = async ({ callType, callID }) => {
  try {
    const streamCall = client.video.call(callType, callID);
    const callExist = await streamCall.get();
    if (callExist) {
      return await streamCall.end();
    }
    return null;
  } catch (error) {
    logger.error("END_STREAM_CALL_ERROR: ", error);
    console.error("END_STREAM_CALL_ERROR: ", error);
    throw error;
  }
};

module.exports = {
  createOrUpdateStreamUser,
  createStreamCall,
  endStreamCall,
  generateStreamUserToken,
};

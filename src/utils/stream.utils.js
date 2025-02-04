const { StreamClient } = require("@stream-io/node-sdk");

const {
  streamSdkApiKey,
  streamSdkApiSecret,
} = require("../config/default.config");

const client = new StreamClient(streamSdkApiKey, streamSdkApiSecret);

const generateStreamUserToken = async (userId) => {
  try {
    const tokenValidity = 24 * 60 * 60;
    return client.generateUserToken({
      user_id: userId,
      validity_in_seconds: tokenValidity,
    });
  } catch (error) {
    console.log("Stream Error: ", error);
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
    console.log("Stream Error: ", error);
    throw error;
  }
};

const createStreamCall = async (call) => {
  const { callType, callID, members, userId, appointmentId } = call;
  const streamCall = client.video.call(callType, callID);
  streamCall.getOrCreate({
    members_limit: 2,
    // Ring and Notify cannot be both true
    // notify: true,
    // ring: true,
    video: true,
    data: {
      created_by_id: userId.toString(),
      members,
      custom: {
        appointmentId,
      },
    },
  });
};
// const getStreamCall = async (call) => {};
// const updateStreamCall = async (call) => {};

module.exports = {
  createOrUpdateStreamUser,
  createStreamCall,
  generateStreamUserToken,
};

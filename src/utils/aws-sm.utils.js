const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const {
  awsRegion,
  awsAccessSecretKey,
  awsAccessKeyId,
} = require("../config/default.config");

const secretName = "prod/Kenecare/EncryptionKey";

const client = new SecretsManagerClient({
  region: awsRegion,
  credentials: {
    secretAccessKey: awsAccessSecretKey,
    accessKeyId: awsAccessKeyId,
  },
});

async function fetchEncryptionKey() {
  console.time("fetchEncryptionKey");

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    const secretString = response.SecretString;

    let secretValue;
    try {
      const parsed = JSON.parse(secretString);
      const [value] = Object.values(parsed); // assuming { key: value }
      secretValue = value;
    } catch (parseError) {
      console.warn("Warning: Secret is not a JSON object. Using raw string.");
      secretValue = secretString;
      throw parseError;
    }

    process.env.ENCRYPTION_KEY = secretValue;
    return secretValue;
  } catch (error) {
    console.error("AWS_SECRET_MANAGER_UTIL_ERROR:", error);
    return null;
  } finally {
    console.timeEnd("fetchEncryptionKey");
  }
}

// // Run the function immediately
// fetchEncryptionKey();

module.exports = {
  fetchEncryptionKey,
};

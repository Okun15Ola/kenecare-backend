/* eslint-disable no-cond-assign */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./middlewares/logger.middleware");

const ENV_NAME = process.argv[2]; // e.g., "production", "staging", "development"
if (!ENV_NAME) {
  logger.error(
    "[.ENV ERROR]: Please provide the environment name. Example: node check-env.js production",
  );
  console.error(
    "❌ Please provide the environment name. Example: node check-env.js production",
  );
  process.exit(1);
}

const envFile = `.env.${ENV_NAME}`;
const envPath = path.resolve(__dirname, "..", envFile);

if (!fs.existsSync(envPath)) {
  logger.error(`[.ENV ERROR]: ${envFile} not found!`);
  console.error(`❌ ${envFile} not found!`);
  process.exit(1);
}

// Load the environment file
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Show total number of variables
const totalEnvVars = Object.keys(envConfig).length;
console.log(`📦 Loaded ${totalEnvVars} environment variables from ${envFile}`);

// Read the config file
const configPath = path.resolve(__dirname, "config", "default.config.js");
const configContent = fs.readFileSync(configPath, "utf-8");

// Find all process.env.XXX or env.XXX patterns
const envRegex = /\b(?:process\.)?env\.([a-zA-Z_][a-zA-Z0-9_]*)/g;

const usedEnvVars = new Set();
let match;
while ((match = envRegex.exec(configContent)) !== null) {
  usedEnvVars.add(match[1]);
}

// Compare with loaded .env.<ENV_NAME>
const missingVars = Array.from(usedEnvVars).filter(
  (key) => !(key in envConfig),
);

if (missingVars.length > 0) {
  logger.error(`[.ENV ERROR]: Missing env vars in ${envFile}:`);
  console.error(`🚨 Missing env vars in ${envFile}:`);
  missingVars.forEach((v) => console.error(`${v}=`));
  process.exit(1);
}

console.log(`✅ All required env vars are present in ${envFile}`);

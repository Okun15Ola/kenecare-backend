/* eslint-disable no-cond-assign */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const ENV_NAME = process.argv[2]; // e.g., "production", "staging", "development"
if (!ENV_NAME) {
  console.error(
    "❌ Please provide the environment name. Example: node check-env.js production",
  );
  process.exit(1);
}

const envFile = `.env.${ENV_NAME}`;
const envPath = path.resolve(__dirname, envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ ${envFile} not found!`);
  process.exit(1);
}

// Load the environment file
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Read the config file
const configPath = path.resolve(
  __dirname,
  "src",
  "config",
  "default.config.js",
);
const configContent = fs.readFileSync(configPath, "utf-8");

// Find all process.env.XXX or env.XXX patterns
const envRegex = /\b(?:process\.)?env\.([a-zA-Z_]\w*)/g;

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
  console.error(`🚨 Missing env vars in ${envFile}:`);
  missingVars.forEach((v) => console.error(`${v}=`));
  process.exit(1);
}

console.log(`✅ All required env vars are present in ${envFile}`);

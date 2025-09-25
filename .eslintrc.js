module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: "latest", // Allow latest ECMAScript features (const, let, etc.)
    sourceType: "module",
  },
  extends: [
    "eslint:recommended", // Base recommended rules
    "plugin:jest/recommended", // Jest-specific linting
  ],
  rules: {
    // Customize rules to your preference
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off", // Allow console logs
  },
};

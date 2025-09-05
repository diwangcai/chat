/* eslint-disable */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "security"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended",
    "next/core-web-vitals"
  ],
  rules: {
    "no-duplicate-case": "error",
    "no-unreachable": "error",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": ["warn", { "ignoreRestArgs": false }],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "security/detect-object-injection": "warn",
    "react/no-unescaped-entities": "warn",
    "react/display-name": "warn"
  },
  ignorePatterns: ["**/dist/**", "**/.next/**"]
};
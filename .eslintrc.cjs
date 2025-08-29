module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "unicorn", "sonarjs", "security"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:unicorn/recommended",
    "plugin:sonarjs/recommended",
    "plugin:security/recommended",
    "prettier",
  ],
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  settings: { "import/resolver": { typescript: {} } },
  ignorePatterns: ["**/.next/**", "**/dist/**", "**/coverage/**"],
  rules: {
    // Relaxations to avoid invasive refactors pre-deploy
    "unicorn/filename-case": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/no-null": "off",
    "unicorn/catch-error-name": "off",
    "unicorn/prefer-add-event-listener": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/prefer-spread": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-dom-node-dataset": "off",
    "unicorn/prefer-dom-node-append": "off",
    "unicorn/prefer-dom-node-remove": "off",
    "unicorn/switch-case-braces": "off",
    "unicorn/prefer-code-point": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/prefer-string-slice": "off",
    "unicorn/no-useless-undefined": "off",
    // SonarJS relaxations
    "sonarjs/no-collapsible-if": "off",
    "sonarjs/cognitive-complexity": "off",
    "sonarjs/no-duplicate-string": "off",
    "sonarjs/no-identical-functions": "off",
    "sonarjs/prefer-immediate-return": "off",
    // Misc
    "unicorn/no-lonely-if": "off",
    "no-empty": "warn",
    // TypeScript tweaks
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
  },
  overrides: [
    {
      files: [
        "*.config.js",
        "next.config.js",
        "postcss.config.js",
        "tailwind.config.js"
      ],
      env: { node: true, es2022: true },
      rules: {
        "unicorn/prefer-module": "off",
        "no-undef": "off",
      },
    },
    {
      files: ["next-env.d.ts"],
      rules: {
        "@typescript-eslint/triple-slash-reference": "off",
      },
    },
  ],
};


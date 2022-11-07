module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  ignorePatterns: ["build"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-use-before-define": ["error", { variables: false }],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
  settings: {
    "import/resolver:": {
      typescript: true,
      node: true,
    },
    "import/extensions": [".js", ".ts"],
  },
};

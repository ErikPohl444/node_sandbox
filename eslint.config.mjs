import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
  },
  {
    languageOptions: {
      globals: {
        // Add Node.js globals here
        require: "readonly", // Add if using require
        module: "readonly", // Add if using module
        __filename: "readonly", // Add if using __filename
        __dirname: "readonly", // Add if using __dirname
        // Add other Node.js globals as needed
      },
      parserOptions: {
        ecmaVersion: "latest", // Or your project's target ECMAScript version
        sourceType: "module", // Or 'script' if you're using CommonJS
        // Add other parser options as needed
      },
    },
    env: {
      "jest/globals": true,
    },
  },
]);

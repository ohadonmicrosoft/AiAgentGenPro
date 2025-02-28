import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        module: "writable",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      // Turn off the react-in-jsx-scope rule which is not needed in React 17+
      "react/react-in-jsx-scope": "off",

      // Relax some TypeScript strictness for development
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",

      // Escape entities in JSX
      "react/no-unescaped-entities": "warn",

      // Allow require imports in certain files - disabling for now
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  {
    files: ["*.js", "*.jsx", "*.cjs", "*.mjs"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["**/*.config.js", "scripts/**/*.js"],
    rules: {
      "no-undef": "off",
    },
  },
];

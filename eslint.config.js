import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
export default ts.config(
  { files: ["scripts/**/*.mjs"], languageOptions: { globals: globals.node } },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".agents/**",
      "supabase/functions/**",
      "test-results/**",
      "playwright-report/**",
      ".tools/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { "react-hooks": hooks },
    rules: {
      ...hooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);

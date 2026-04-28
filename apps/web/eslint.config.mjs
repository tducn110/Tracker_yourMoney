import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),
  {
    rules: {
      // Allow inline styles primarily for dynamic CSS variables (Standard project pattern)
      // Note: We've manually refactored critical components to use Tailwind, 
      // but UI primitives (charts, progress) still use them legitimately.
      "react/no-inline-styles": "off",
      
      // Suppress ARIA warnings that may misinterpret React expressions
      "jsx-a11y/aria-proptypes": "off",
      
      // Enforce type safety
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    }
  }
];

export default eslintConfig;

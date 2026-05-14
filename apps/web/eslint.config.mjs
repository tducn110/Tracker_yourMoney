import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Allow inline styles primarily for dynamic CSS variables (Standard project pattern)
      // Note: We've manually refactored critical components to use Tailwind, 
      // but UI primitives (charts, progress) still use them legitimately.
      "react/no-inline-styles": "off",
      
      // Suppress ARIA warnings that may misinterpret React expressions
      "jsx-a11y/aria-proptypes": "off",
      
      // Keep legacy app lintable while stricter typing is paid down incrementally.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    }
  }
];

export default eslintConfig;

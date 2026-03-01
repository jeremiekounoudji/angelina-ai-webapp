const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Temporarily disabled due to missing plugin configuration in Flat Config:
      // "@typescript-eslint/no-unused-vars": "error",
      // "@typescript-eslint/no-explicit-any": "error",
      // "react-hooks/exhaustive-deps": "error",
      // "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;

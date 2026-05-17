/** @type {import("prettier").Config} */
const config = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    // WHY: tailwindcss plugin must be last per its docs
    "prettier-plugin-tailwindcss",
  ],
  // Per code-standards.md § Imports: external → internal alias (@/) → relative
  importOrder: [
    "<BUILT_IN_MODULES>",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(.*)$",
    "",
    "^[.]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
};

export default config;

// @ts-check
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// WHY: these zones enforce the scoring/domain isolation non-negotiable from
// code-standards.md § "Scoring + domain module isolation". The rule is active
// now (not 'off') so it auto-engages the moment epic 02 creates these dirs —
// no config change required. Each zone reads: files matching `from` may NOT
// import from `target`.
const RESTRICTED_PATH_ZONES = [
  {
    target: "./services/api/src/scoring",
    from: [
      "./services/api/src/db",
      "./services/api/src/repositories",
      "./services/api/src/routes",
      "./services/api/src/cron",
      "./services/api/src/providers",
      "./services/api/src/notifications",
    ],
    message:
      "scoring/ is a pure module — it must not import from DB, repositories, routes, cron, providers, or notifications.",
  },
  {
    target: "./services/api/src/domain",
    from: [
      "./services/api/src/db",
      "./services/api/src/repositories",
      "./services/api/src/routes",
      "./services/api/src/cron",
      "./services/api/src/providers",
      "./services/api/src/notifications",
    ],
    message:
      "domain/ is a pure module — it must not import from DB, repositories, routes, cron, providers, or notifications.",
  },
];

export default tseslint.config(
  // 1. Global ignores
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "apps/web/src/routeTree.gen.ts",
      "apps/web/src/lib/api-client/**",
      "**/*.config.js",
      ".vercel/**",
    ],
  },

  // 2. Base JS recommended
  js.configs.recommended,

  // 3. TypeScript recommended (non-type-checked; type-checked rules deferred to FND-005)
  {
    files: ["**/*.{ts,tsx}"],
    extends: tseslint.configs.recommended,
    rules: {
      // Per code-standards.md § Dead code: error (not the recommended 'warn')
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // 4. import-x rules: resolver + no-restricted-paths boundary
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "import-x": importX,
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: ["apps/web/tsconfig.json", "services/api/tsconfig.json"],
        },
      },
    },
    rules: {
      "import-x/no-restricted-paths": [
        "error",
        { zones: RESTRICTED_PATH_ZONES },
      ],
    },
  },

  // 5. React hooks — scoped to apps/web only
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 6. Language options per package
  {
    files: ["services/api/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },

  // 7. Prettier last — disables ESLint rules that conflict with Prettier formatting
  prettierConfig,
);

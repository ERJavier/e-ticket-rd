import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import securityPlugin from "eslint-plugin-security";
import sonarjsPlugin from "eslint-plugin-sonarjs";

const eslintConfig = [
  // Base JavaScript config
  js.configs.recommended,

  // Next.js configurations
  nextPlugin.flatConfig.recommended,
  nextPlugin.flatConfig.coreWebVitals,

  // React plugin configuration
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Global ignore patterns
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      ".turbo/**",
      ".eslintcache",
      "public/**",
      "next-env.d.ts",
      "postcss.config.*",
      "tailwind.config.*",
      "**/*.d.ts"
    ],
  },

  // TypeScript files configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: "type-imports"
      }],

      // Disable base ESLint rules that are covered by TypeScript
      "no-unused-vars": "off", // TypeScript handles this
      "no-undef": "off", // TypeScript handles this
    },
  },

  // All JavaScript and TypeScript files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // General code quality rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "no-unreachable": "error",
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "prefer-template": "error",
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",

      // Security and best practices
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
    },
  },

  // Security plugin configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      security: securityPlugin,
    },
    rules: {
      // Security rules
      "security/detect-object-injection": "error",
      "security/detect-non-literal-regexp": "error",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "error",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
    },
  },

  // SonarJS plugin configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [".lintstagedrc.js"], // Exclude lint-staged config from duplicate string checks
    plugins: {
      sonarjs: sonarjsPlugin,
    },
    rules: {
      // Code quality and bug detection
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-duplicate-string": ["error", { "threshold": 3 }],
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/no-useless-catch": "error",
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/prefer-object-literal": "error",
      "sonarjs/prefer-single-boolean-return": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-same-line-conditional": "error",
      "sonarjs/max-switch-cases": ["error", 30],
      "sonarjs/no-nested-switch": "error",
      "sonarjs/no-nested-template-literals": "error",
    },
  },

  // React and JSX files
  reactPlugin.configs.flat.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    files: ["**/*.{jsx,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React-specific rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/jsx-uses-react": "off", // Not needed in Next.js
      "react/jsx-uses-vars": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-deprecated": "warn",
      "react/no-unsafe": "warn",
      "react/jsx-key": "error",
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": ["error", "never"],

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Accessibility rules
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      // Accessibility rules (critical for government projects)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/lang": "error",
      "jsx-a11y/no-aria-hidden-on-focusable": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/img-redundant-alt": "error",
    },
  },

  // Import rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      // Import/Export organization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type"
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-cycle": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // TypeScript handles this better
    },
  },

  // Configuration files (more relaxed rules)
  {
    files: ["*.config.{js,ts,mjs}", "tailwind.config.{js,ts}"],
    rules: {
      "import/no-anonymous-default-export": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-undef": "off",
    },
  },

  // Lint-staged specific exception
  {
    files: [".lintstagedrc.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "sonarjs/no-duplicate-string": "off", // lint-staged configs often repeat command strings
      "no-undef": "off",
    },
  },

  // Test files (more relaxed rules)
  {
    files: [
      "**/__tests__/**/*",
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/tests/**/*"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },

  // Prettier integration - must be last to override other formatting rules
  prettierConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];

export default eslintConfig;

module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: [require.resolve('babel-preset-react-app/prod')],
    },
  },
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb", "eslint:recommended", "plugin:prettier/recommended", "prettier/react"],
  plugins: ["simple-import-sort"],
  ignorePatterns: ["/dist", "/node_modules", " .eslintrc.js"],
  rules: {
    // Prettier issues are shown as warnings
    "prettier/prettier": "warn",

    // Add import sorting
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // Side effect imports.
          ["^\\u0000"],
          // If React is imported, separate it
          ["^react$"],
          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter (excluding src/)
          ["^@?(?!src)\\w"],
          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything not matched in another group.
          ["^"],
          // Relative imports.
          // Anything that starts with a dot.
          ["^\\."],
        ],
      },
    ],
    "simple-import-sort/exports": "warn",

    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    "no-prototype-builtins": "off",

    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    // "import/prefer-default-export": "off",
    // "import/no-default-export": "error",

    "no-underscore-dangle": "off",

    // Hoping to use TS
    "react/prop-types": "off",
    //  Define defaults in destructuring
    "react/require-default-props": "off",
    // We can use normal .js extensions
    "react/jsx-filename-extension": "off",

    // RULES TO REMOVE AT SOME POINT
    "no-use-before-define": "off",
    "no-console": "off",
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      env: {
        browser: true,
        es2021: true,
      },
      extends: [
        "airbnb-typescript",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
        "prettier/react",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint", "simple-import-sort"],
      rules: {
        // Makes no sense to allow type inferrence for expression parameters, but require typing the response
        "@typescript-eslint/explicit-function-return-type": [
          "error",
          { allowExpressions: true, allowTypedFunctionExpressions: true },
        ],
        "@typescript-eslint/no-use-before-define": [
          "error",
          { functions: false, classes: true, variables: true, typedefs: true },
        ],

        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      },
    },
  ],
};

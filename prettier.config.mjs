/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'always',
  overrides: [
    {
      /* The docs people read: one line per paragraph, so every viewer wraps them to its own width. */
      files: [
        './README.md',
        './HOW_IT_WORKS.md',
        './PRESERVATION.md',
        './DEVELOPMENT.md',
        './CHANGELOG.md',
      ],
      options: { proseWrap: 'never' },
    },
  ],
};

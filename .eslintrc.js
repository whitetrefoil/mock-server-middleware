module.exports = {
  root: true,

  extends: [
    '@whitetrefoil/eslint-config/with-type/node',
  ],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['scripts/*.js'],
      rules: {
        'no-console': 0,
      },
    },

    {
      files: ['src/**/*.ts'],
      rules: {
        'node/callback-return'                 : 0,
        'node/global-require'                  : 0,
        '@typescript-eslint/no-require-imports': 0,
        '@typescript-eslint/no-var-requires'   : 0,

      },
    },

    {
      files: ['src/logger.ts'],
      rules: {
        'no-console': 0,
      },
    },
  ],
}

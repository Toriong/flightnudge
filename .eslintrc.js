module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  globals: {
    CalendarApp: 'readonly',
    CardService: 'readonly',
    PropertiesService: 'readonly',
    ScriptApp: 'readonly',
    Session: 'readonly',
    HtmlService: 'readonly',
    Calendar: 'readonly',
    GoogleAppsScript: 'readonly',
  },
};

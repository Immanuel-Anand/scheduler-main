module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
    es6: true
  }
} 
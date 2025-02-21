module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
} 
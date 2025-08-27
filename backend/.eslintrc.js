module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    es2022: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/**/*', 'node_modules/**/*'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': 'off', // Let Prettier handle this
    'indent': 'off', // Let Prettier handle this
    'quotes': 'off', // Let Prettier handle this
    'semi': 'off', // Let Prettier handle this
    'comma-dangle': 'off', // Let Prettier handle this
    'object-curly-spacing': 'off', // Let Prettier handle this
    'array-bracket-spacing': 'off', // Let Prettier handle this
    'key-spacing': 'off', // Let Prettier handle this
    'space-infix-ops': 'off', // Let Prettier handle this  
    'keyword-spacing': 'off', // Let Prettier handle this
    'no-trailing-spaces': 'off', // Let Prettier handle this
    'eol-last': 'off', // Let Prettier handle this
    'no-multiple-empty-lines': 'off', // Let Prettier handle this
  },
};
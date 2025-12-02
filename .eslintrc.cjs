module.exports = {
  env: { es2020: true, node: true },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    allowImportExportEverywhere: true,
  },
  plugins: ['unused-imports'],
  rules: {
    // Common
    'no-console': 1,
    'no-lonely-if': 1,
    'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
    'unused-imports/no-unused-imports': 'warn',

    // Prettier will handle formatting, remove conflicting rules
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
  },
}

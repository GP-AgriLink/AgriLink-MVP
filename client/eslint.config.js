import globals from 'globals';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 1. Base JS configuration
  js.configs.recommended,

  // 2. React configurations
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ...react.configs.recommended.languageOptions,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules, // For React 17+ new JSX transform
      ...reactHooks.configs.recommended.rules,

      // Rules to disable (let Prettier handle them)
      ...prettierConfig.rules,

      // Our custom rules
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off', // We're not using PropTypes
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // Allow unused args starting with _
          varsIgnorePattern: '^_', // Allow unused vars starting with _
        },
      ],
    },
  },

  // 3. Ignore files
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.config.js', // Ignore config files themselves
      '*.config.mjs',
      '*.config.cjs',
    ],
  },
];

import js from '@eslint/js';
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      js,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    extends: ['js/recommended', pluginReact.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/display-name': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
    rules: {
      ...css.configs.recommended.rules,
      'css/no-important': 'off',
    },
  },
]);

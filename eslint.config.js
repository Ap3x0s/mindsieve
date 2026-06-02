import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import perfectionist from 'eslint-plugin-perfectionist'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-imports': ['warn', { type: 'alphabetical', order: 'asc' }],
      'perfectionist/sort-named-imports': ['warn', { type: 'alphabetical', order: 'asc' }],
      'perfectionist/sort-exports': ['warn', { type: 'alphabetical', order: 'asc' }],
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
])

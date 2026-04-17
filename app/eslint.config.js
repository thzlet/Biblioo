// configuração do ESLint no formato “flat config”
import js from '@eslint/js'
import globals from 'globals' // variaveis globais
import reactHooks from 'eslint-plugin-react-hooks' // validando regras de hooks
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint' // suporte ao ts
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'], // aplica regras so em ts e tsx
    extends: [ // extensoes
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

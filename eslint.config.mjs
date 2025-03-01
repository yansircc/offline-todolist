import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

// 正确获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: true,
})

// 首先定义忽略配置
const ignores = {
  ignores: [
    // Build outputs
    '.next/**',
    'dist/**',
    'build/**',
    'out/**',
    // Dependencies
    'node_modules/**',
    // Config files
    '*.config.ts',
    '*.config.mjs',
    'next-env.d.ts',
    'tailwind.config.mjs',
    'tsconfig.json',
    '*.config.js',
    // Other
    '.vercel/**',
    '.coverage/**',
    '*.log',
    '.git/**',
    '.husky/**',
    '.vscode/**',
    // Public assets
    'public/**',
    // Generated files
    'generated/**',
    '*.generated.*',
    // Husky
    '.lintstagedrc.js',
  ],
}

// 获取继承的配置
const configs = compat.config({
  extends: ['next/core-web-vitals'],
})

// TypeScript 配置
const typescriptConfigs = compat.config({
  extends: [
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
})

export default [
  // 忽略配置必须放在第一位
  ignores,
  ...configs,
  ...typescriptConfigs,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
]

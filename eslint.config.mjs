import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      perfectionist
    },
    rules: {
      'no-unused-vars': 'off',
      'no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'alphabetical',
          order: 'asc',

          fallbackSort: {
            type: 'unsorted'
          },

          ignoreCase: true,
          specialCharacters: 'keep',
          internalPattern: ['^@/.+'],
          partitionByComment: false,
          partitionByNewLine: false,
          newlinesBetween: 'ignore',

          groups: [
            'next',
            'react',
            ['builtin', 'external'],
            {
              newlinesBetween: 1
            },
            'internal',
            'parent',
            'sibling',
            'index'
          ],

          customGroups: [
            {
              groupName: 'next',
              modifiers: ['value'],
              elementNamePattern: ['^next$', '^next/.+']
            },
            {
              groupName: 'react',
              modifiers: ['value'],
              elementNamePattern: ['^react$', '^react-.+']
            }
          ]
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.

  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ])
]);

export default eslintConfig;

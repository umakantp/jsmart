import globals from 'globals';
import tseslint from 'typescript-eslint';


export default [
  {
    files: ['src/**/*.{js,mjs,cjs,ts}'],
    ignores: ['examples/*'],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...tseslint.configs.recommended,
  {
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'no-console': 'warn',
      'semi': ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'all',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }
      ]
    }
  }
];

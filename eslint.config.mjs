// Flat ESLint config (Next 16 ships native flat configs; `next lint` is gone).
import next from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'scripts/**'] },
  ...next,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      // These React-Compiler-era rules fire on intentional patterns we use
      // (SSR mount flags, async fetch -> setState in effects, memoized option
      // lists). They are advisory here, not bugs — keep as warnings.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;

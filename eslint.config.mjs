import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'no-empty': 'off',
    semi: ['error', 'always'],
    indent: ['error', 2],
    quotes: ['error', 'single'],
  },
});

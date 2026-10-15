// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(prettier, {
  rules: {
    'vue/no-v-html': 'error',
    'vue/multi-word-component-names': 'off',
  },
}).append({
  ignores: ['.output/**', 'test-results/**', 'playwright-report/**', 'docs/**'],
})

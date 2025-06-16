import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Initialize Pinia before each test
beforeEach(() => {
  setActivePinia(createPinia());
});

// Optional: Global stubs or plugins for Vuetify if needed for deep component tests
// For example, to prevent warnings about Vuetify components not being registered globally
// if you are not mounting with a host Vuetify instance.
// However, for store tests and shallow component tests, this might not be necessary.
// For testing components that heavily rely on Vuetify, a more complete setup might be needed.

// Example: Stubbing Vuetify components globally (use with caution)
// import { vi } from 'vitest';
// config.global.stubs = {
//   'v-text-field': { template: '<input type="text" />' },
//   'v-select': { template: '<select />' },
//   'v-btn': { template: '<button><slot /></button>' },
//   // Add other Vuetify components you want to stub globally
// };

// Mock Nuxt's auto-imports like `useRuntimeConfig` if they cause issues in tests
// For example:
// vi.mock('#app', () => ({
//   useRuntimeConfig: vi.fn().mockReturnValue({ public: {} }),
// }));

// If you use Nuxt's composables like `useFetch` or `navigateTo` outside of components,
// you might need to mock them here or in specific test files.
// vi.mock('#imports', ()_ => ({
//   useFetch: vi.fn(),
//   navigateTo: vi.fn(),
// }));

console.log('Vitest global setup initialized.');

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import AvailableElements from '~/components/AvailableElements.vue';
import { useFormBuilderStore } from '~/stores/formBuilderStore';
import { availableElements as elementDefinitions } from '~/components/formElementDefinitions'; // Actual definitions

// Basic Vuetify stubs
const vuetifyStubs = {
  'v-card': { template: '<div><slot name="title"/><slot/></div>' },
  'v-card-title': { template: '<div><slot/></div>' },
  'v-list': { template: '<div><slot/></div>', props: ['nav', 'density'] },
  'v-list-item': { template: '<div @click="$emit(\'click\')"><slot name="prepend"/><slot/><slot name="append"/></div>', props: ['link', 'title', 'draggable'] },
  'v-icon': { template: '<i></i>', props: ['icon'] },
  'v-btn': { template: '<button @click="$emit(\'click\')"><slot/></button>', props: ['size', 'variant', 'color', 'icon', 'title'] },
  'v-divider': { template: '<hr/>' },
};

describe('AvailableElements.vue', () => {
  let store: ReturnType<typeof useFormBuilderStore>;

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false, // Test if actions are called
    });
    store = useFormBuilderStore(pinia);
  });

  it('renders a list of available elements', () => {
    const wrapper = mount(AvailableElements, {
      global: {
        plugins: [store.$pinia], // Corrected: use store.$pinia
        stubs: vuetifyStubs,
      },
    });
    // Check if the number of rendered items matches the definitions
    const items = wrapper.findAllComponents(vuetifyStubs['v-list-item']);
    expect(items.length).toBe(elementDefinitions.length);

    // Check if display names are rendered
    for (let i = 0; i < elementDefinitions.length; i++) {
      expect(items[i].text()).toContain(elementDefinitions[i].displayName);
    }
  });

  it('calls store.addElement with correct payload when an element\'s "Add" button is clicked', async () => {
    const wrapper = mount(AvailableElements, {
      global: {
        plugins: [store.$pinia],
        stubs: vuetifyStubs,
      },
    });

    // Find the "Add" button for the first element definition (e.g., Text Input)
    const firstElementDef = elementDefinitions[0];
    const listItems = wrapper.findAllComponents(vuetifyStubs['v-list-item']);
    const firstItemAddButton = listItems[0].findComponent(vuetifyStubs['v-btn']);

    expect(firstItemAddButton.exists()).toBe(true);
    await firstItemAddButton.trigger('click');

    expect(store.addElement).toHaveBeenCalledTimes(1);

    const payload = (store.addElement as any).mock.calls[0][0];
    expect(payload.type).toBe(firstElementDef.type);
    expect(payload.label).toBe(firstElementDef.defaultConfig.label); // Check some default props
    expect(payload.id).toBeTypeOf('string'); // ID should be generated
  });

  it('calls store.addElement when a list item is clicked (due to @click on v-list-item)', async () => {
    const wrapper = mount(AvailableElements, {
        global: {
            plugins: [store.$pinia],
            stubs: vuetifyStubs,
        },
    });

    const secondElementDef = elementDefinitions[1]; // e.g., Text Area
    const listItems = wrapper.findAllComponents(vuetifyStubs['v-list-item']);

    await listItems[1].trigger('click'); // Click the v-list-item itself

    expect(store.addElement).toHaveBeenCalledTimes(1);
    const payload = (store.addElement as any).mock.calls[0][0];
    expect(payload.type).toBe(secondElementDef.type);
    expect(payload.label).toBe(secondElementDef.defaultConfig.label);
    expect(payload.id).toBeTypeOf('string');
  });

  // Drag start is harder to test meaningfully in a unit test without complex setup.
  // We're focusing on the action call from click here.
  // The handleDragStart method itself is simple (setData).
});

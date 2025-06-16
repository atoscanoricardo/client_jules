import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ElementEditor from '~/components/ElementEditor.vue';
import { useFormBuilderStore, type FormElement } from '~/stores/formBuilderStore';
import { nextTick } from 'vue';

// Mock Vuetify components that are directly used or cause warnings
// This is a basic stubbing. For complex interactions, more detailed stubs might be needed.
const vuetifyStubs = {
  'v-dialog': { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  'v-card': { template: '<div><slot name="title" /><slot name="text" /><slot name="actions" /><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-tabs': { template: '<div><slot /></div>', props: ['modelValue'] },
  'v-tab': { template: '<div><slot /></div>' },
  'v-window': { template: '<div><slot /></div>', props: ['modelValue'] },
  'v-window-item': { template: '<div><slot /></div>' },
  'v-text-field': { template: '<input type="text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue', 'label', 'hint'] },
  'v-textarea': { template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>', props: ['modelValue', 'label', 'hint'] },
  'v-select': { template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>', props: ['modelValue', 'label', 'items', 'hint'] },
  'v-switch': { template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />', props: ['modelValue', 'label'] },
  'v-btn': { template: '<button><slot /></button>' },
  'v-spacer': { template: '<div></div>' },
  'v-divider': { template: '<hr />' },
  'v-icon': { template: '<i></i>'}
};

describe('ElementEditor.vue', () => {
  let store: ReturnType<typeof useFormBuilderStore>;

  beforeEach(() => {
    // Create a fresh Pinia instance and store for each test
    const pinia = createTestingPinia({
      // `createSpy: vi.fn` will track store actions, getters, etc.
      createSpy: vi.fn,
      initialState: {
        formBuilder: { // Ensure this matches the store ID
          formElements: [],
          selectedElementId: null,
        },
      },
      stubActions: false, // We want to test actions being called, but not their internal logic here
    });
    store = useFormBuilderStore(pinia); // Use the testing pinia instance
  });

  const sampleElement: FormElement = {
    id: 'el1',
    type: 'text',
    label: 'Test Label',
    variableName: 'testVar',
    placeholder: 'Test placeholder',
    hint: 'Test hint',
    value: 'Initial Value',
    requirementLevel: 'Optional',
    chapter: 'Ch1',
    question: 'Q1?',
    questionNumber: '1.1',
    consistencyCondition: '',
    inconsistencyMessage: '',
    errorType: 'Soft',
    description: 'Desc',
    rules: [],
    name: 'testName',
    specificType: 'text',
    required: false,
    disabled: false,
    readonly: false,
  };

  it('populates editableElement when an element is selected in the store', async () => {
    // Set an element as selected in the store
    store.formElements = [sampleElement];
    store.selectedElementId = sampleElement.id;

    const wrapper = mount(ElementEditor, {
      global: {
        plugins: [store.$pinia], // Corrected: use store.$pinia
        stubs: vuetifyStubs,
      },
    });

    await nextTick(); // Wait for watchers to react

    // ElementEditor becomes visible because selectedElement is not null
    // Accessing vm is possible, but let's verify by checking a known input field's value
    // that is tied to editableElement via v-model in the component's template.
    // This indirectly verifies editableElement is populated.
    expect(wrapper.find('.element-editor-card').exists()).toBe(true);

    // Find the input corresponding to the 'label' v-text-field by its props or a test-id if added.
    // Since stubs are basic, direct value checking on input elements is more reliable here.
    const allInputs = wrapper.findAll('input[type="text"]');
    const labelInputStub = allInputs.find(i => {
        // Heuristic: find the input that would correspond to the label "Label"
        // This is fragile and assumes order or unique labels in stubs.
        // A better way would be to add data-testid attributes in ElementEditor.vue
        // For now, let's assume it's the first one or has a distinguishable prop if stub was more complex.
        // Given our current stub, we can't easily distinguish by label prop on the stub itself.
        // We'll rely on the fact that editableElement.label is bound.
        // The test below for 'Save Changes' will be more robust by modifying vm state.
        return true; // Placeholder, this test will be less specific about *which* input
    });
    // This test is more about editableElement being populated than specific input finding with current stubs.
    // We'll verify specific fields in the 'saveChanges' test by manipulating vm state.
    // @ts-ignore - Accessing vm for test purposes
    expect(wrapper.vm.editableElement.label).toBe(sampleElement.label);
    // @ts-ignore
    expect(wrapper.vm.editableElement.variableName).toBe(sampleElement.variableName);
  });

  it('calls store.updateElement with modified data on Save Changes', async () => {
    store.formElements = [JSON.parse(JSON.stringify(sampleElement))]; // Ensure a fresh copy
    store.selectedElementId = sampleElement.id;

    const wrapper = mount(ElementEditor, {
      global: {
        plugins: [store.$pinia], // Corrected
        stubs: vuetifyStubs,
      },
    });
    await nextTick(); // Ensure component is mounted and watchers have run

    // Directly modify the component's internal state that v-model binds to
    // This bypasses issues with complex stub interaction for input simulation
    // @ts-ignore - Accessing vm and its internal refs for test purposes
    wrapper.vm.editableElement.label = 'New Test Label';
    // @ts-ignore
    wrapper.vm.editableElement.placeholder = 'New Placeholder Text';

    await nextTick(); // Allow UI to react if it were real (though not strictly needed here as we bypass UI)

    // Find and click the "Save Changes" button
    const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save Changes'));
    expect(saveButton).toBeDefined();
    await saveButton!.trigger('click');

    expect(store.updateElement).toHaveBeenCalledTimes(1);
    const updatedElementPayload = (store.updateElement as any).mock.calls[0][0];

    expect(updatedElementPayload.id).toBe(sampleElement.id);
    expect(updatedElementPayload.label).toBe('New Test Label');
    expect(updatedElementPayload.placeholder).toBe('New Placeholder Text');
    expect(updatedElementPayload.variableName).toBe(sampleElement.variableName); // Ensure other fields are preserved
  });

  it('calls store.setSelectedElement(null) on Close Editor', async () => {
    store.formElements = [sampleElement];
    store.selectedElementId = sampleElement.id;

    const wrapper = mount(ElementEditor, {
      global: {
        plugins: [store.$pinia], // Corrected
        stubs: vuetifyStubs,
      },
    });
    await nextTick();

    const closeButton = wrapper.find('button[title="Close editor"]');
    expect(closeButton.exists()).toBe(true);
    await closeButton.trigger('click');

    expect(store.setSelectedElement).toHaveBeenCalledWith(null);
  });

  it('handles select options correctly', async () => {
    const selectSample: FormElement = {
        ...sampleElement,
        id: 'selectEl',
        type: 'select',
        options: ['Opt1', {text: 'Option 2', value: 'opt2val'}],
    };
    store.formElements = [JSON.parse(JSON.stringify(selectSample))]; // Fresh copy
    store.selectedElementId = selectSample.id;

    const wrapper = mount(ElementEditor, {
        global: { plugins: [store.$pinia], stubs: vuetifyStubs }, // Corrected
    });
    await nextTick();

    // @ts-ignore - Accessing vm internal refs for test
    wrapper.vm.selectItemsText = 'NewOpt1\nval2|NewLabel2';
    await nextTick();

    const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save Changes'));
    await saveButton!.trigger('click');

    expect(store.updateElement).toHaveBeenCalledTimes(1);
    const payload = (store.updateElement as any).mock.calls[0][0];
    expect(payload.options).toEqual([
        { value: 'NewOpt1', text: 'NewOpt1' },
        { value: 'val2', text: 'NewLabel2' },
    ]);
    }
  });

  it('calls store.updateElement with modified data on Save Changes', async () => {
    store.formElements = [sampleElement];
    store.selectedElementId = sampleElement.id;

    const wrapper = mount(ElementEditor, {
      global: {
        plugins: [store.$ αρκετόPinia],
        stubs: vuetifyStubs,
      },
    });
    await nextTick();

    // Simulate changing the label
    const labelInput = wrapper.findAllComponents(vuetifyStubs['v-text-field']).find(c => c.props('label') === 'Label');
    expect(labelInput).toBeDefined();
    await labelInput!.vm.$emit('update:modelValue', 'New Test Label');

    // Simulate changing another field, e.g. placeholder
    const placeholderInput = wrapper.findAllComponents(vuetifyStubs['v-text-field']).find(c => c.props('label') === 'Placeholder');
    expect(placeholderInput).toBeDefined();
    await placeholderInput!.vm.$emit('update:modelValue', 'New Placeholder Text');

    // Find and click the "Save Changes" button
    const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save Changes'));
    expect(saveButton).toBeDefined();
    await saveButton!.trigger('click');

    expect(store.updateElement).toHaveBeenCalledTimes(1);
    const updatedElementPayload = (store.updateElement as any).mock.calls[0][0];

    expect(updatedElementPayload.id).toBe(sampleElement.id);
    expect(updatedElementPayload.label).toBe('New Test Label');
    expect(updatedElementPayload.placeholder).toBe('New Placeholder Text');
    expect(updatedElementPayload.variableName).toBe(sampleElement.variableName); // Ensure other fields are preserved
  });

  it('calls store.setSelectedElement(null) on Close Editor', async () => {
    store.formElements = [sampleElement];
    store.selectedElementId = sampleElement.id;

    const wrapper = mount(ElementEditor, {
      global: {
        plugins: [store.$ αρκετόPinia],
        stubs: vuetifyStubs,
      },
    });
    await nextTick();

    const closeButton = wrapper.find('button[title="Close editor"]'); // Using title as it's more specific
    expect(closeButton.exists()).toBe(true);
    await closeButton.trigger('click');

    expect(store.setSelectedElement).toHaveBeenCalledWith(null);
  });

  it('handles select options correctly', async () => {
    const selectSample: FormElement = {
        ...sampleElement,
        id: 'selectEl',
        type: 'select',
        options: ['Opt1', {text: 'Option 2', value: 'opt2val'}],
    };
    store.formElements = [selectSample];
    store.selectedElementId = selectSample.id;

    const wrapper = mount(ElementEditor, {
        global: { plugins: [store.$ αρκετόPinia], stubs: vuetifyStubs },
    });
    await nextTick();

    // Check initial selectItemsText
    // This requires accessing component's internal state, which is less ideal but sometimes necessary for complex transformations
    // For a more robust test, you might emit an event from the component with the current selectItemsText or test the visual output.
    // For now, we'll trust the watcher logic for population.

    const optionsTextarea = wrapper.findAllComponents(vuetifyStubs['v-textarea']).find(c => c.props('label')?.includes('Dropdown Options'));
    expect(optionsTextarea).toBeDefined();
    await optionsTextarea!.vm.$emit('update:modelValue', 'NewOpt1\nval2|NewLabel2');

    const saveButton = wrapper.findAll('button').find(btn => btn.text().includes('Save Changes'));
    await saveButton!.trigger('click');

    expect(store.updateElement).toHaveBeenCalledTimes(1);
    const payload = (store.updateElement as any).mock.calls[0][0];
    expect(payload.options).toEqual([
        { value: 'NewOpt1', text: 'NewOpt1' },
        { value: 'val2', text: 'NewLabel2' },
    ]);
  });
});

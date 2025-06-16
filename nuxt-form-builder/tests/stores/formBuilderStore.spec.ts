import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFormBuilderStore, type FormElement } from '~/stores/formBuilderStore';

describe('formBuilderStore', () => {
  beforeEach(() => {
    // Ensure a fresh Pinia instance is active for each test
    setActivePinia(createPinia());
  });

  it('initializes with an empty formElements array and null selectedElementId', () => {
    const store = useFormBuilderStore();
    expect(store.formElements).toEqual([]);
    expect(store.selectedElementId).toBeNull();
  });

  describe('actions', () => {
    it('addElement: adds an element to formElements with a unique ID', () => {
      const store = useFormBuilderStore();
      const newElement: Partial<FormElement> = {
        type: 'text',
        label: 'Test Input',
      };
      store.addElement(newElement as FormElement); // Cast because ID is generated

      expect(store.formElements.length).toBe(1);
      expect(store.formElements[0].type).toBe('text');
      expect(store.formElements[0].label).toBe('Test Input');
      expect(store.formElements[0].id).toBeTypeOf('string');

      const firstId = store.formElements[0].id;
      store.addElement({ type: 'textarea', label: 'Test Area' } as FormElement);
      expect(store.formElements.length).toBe(2);
      expect(store.formElements[1].id).toBeTypeOf('string');
      expect(store.formElements[1].id).not.toBe(firstId); // Check for unique IDs
    });

    it('addElement: uses provided ID if available', () => {
        const store = useFormBuilderStore();
        const customElement: FormElement = {
            id: 'custom-123',
            type: 'text',
            label: 'Custom ID ELement'
        };
        store.addElement(customElement);
        expect(store.formElements.length).toBe(1);
        expect(store.formElements[0].id).toBe('custom-123');
    });


    it('removeElement: removes an element by ID and deselects if it was selected', () => {
      const store = useFormBuilderStore();
      const el1: FormElement = { id: '1', type: 'text', label: 'First' };
      const el2: FormElement = { id: '2', type: 'textarea', label: 'Second' };
      store.formElements = [el1, el2];
      store.selectedElementId = '1';

      store.removeElement('1');
      expect(store.formElements.length).toBe(1);
      expect(store.formElements[0].id).toBe('2');
      expect(store.selectedElementId).toBeNull(); // Should deselect

      store.selectedElementId = '2'; // Select the remaining one
      store.removeElement('non-existent-id'); // Try removing non-existent
      expect(store.formElements.length).toBe(1); // Should not change
      expect(store.selectedElementId).toBe('2');


      store.removeElement('2');
      expect(store.formElements).toEqual([]);
      expect(store.selectedElementId).toBeNull();
    });

    it('updateElement: updates properties of an existing element', () => {
      const store = useFormBuilderStore();
      const initialElement: FormElement = { id: 'edit-me', type: 'text', label: 'Original Label', value: 'Old Value' };
      store.formElements = [initialElement];

      const updatedProps: FormElement = {
        ...initialElement, // Ensure all required fields are present
        label: 'Updated Label',
        value: 'New Value',
        placeholder: 'New Placeholder'
      };
      store.updateElement(updatedProps);

      expect(store.formElements.length).toBe(1);
      const updated = store.formElements[0];
      expect(updated.label).toBe('Updated Label');
      expect(updated.value).toBe('New Value');
      expect(updated.placeholder).toBe('New Placeholder');

      // Try updating non-existent element
      store.updateElement({ id: 'does-not-exist', type: 'text', label: 'Ghost' } as FormElement);
      expect(store.formElements.length).toBe(1); // Should not add new or error
    });

    it('setSelectedElement: updates selectedElementId', () => {
      const store = useFormBuilderStore();
      store.setSelectedElement('elem1');
      expect(store.selectedElementId).toBe('elem1');

      store.setSelectedElement(null);
      expect(store.selectedElementId).toBeNull();
    });

     it('initializeForm: resets formElements and selectedElementId', () => {
      const store = useFormBuilderStore();
      store.formElements = [{ id: '1', type: 'text', label: 'Old' } as FormElement];
      store.selectedElementId = '1';

      const newElements: FormElement[] = [
        { id: 'new1', type: 'text', label: 'New Text' },
        { id: 'new2', type: 'textarea', label: 'New Area' },
      ];
      store.initializeForm(newElements);

      expect(store.formElements).toEqual(newElements);
      expect(store.selectedElementId).toBeNull();
    });
  });

  describe('getters', () => {
    it('getFormElements: returns the formElements array', () => {
      const store = useFormBuilderStore();
      const elements: FormElement[] = [{ id: '1', type: 'text', label: 'Test' }];
      store.formElements = elements;
      expect(store.getFormElements).toEqual(elements);
    });

    it('getSelectedElement: returns the selected element or undefined', () => {
      const store = useFormBuilderStore();
      const el1: FormElement = { id: '1', type: 'text', label: 'First' };
      const el2: FormElement = { id: '2', type: 'textarea', label: 'Second' };
      store.formElements = [el1, el2];

      expect(store.getSelectedElement).toBeUndefined(); // Initially undefined

      store.selectedElementId = '1';
      expect(store.getSelectedElement).toEqual(el1);

      store.selectedElementId = '2';
      expect(store.getSelectedElement).toEqual(el2);

      store.selectedElementId = 'non-existent';
      expect(store.getSelectedElement).toBeUndefined();

      store.selectedElementId = null;
      expect(store.getSelectedElement).toBeUndefined();
    });
  });
});

import { defineStore } from 'pinia'

// Define a type for form elements for better type safety
export interface FormElement {
  // Core properties
  id: string; // Unique ID for each element
  type: string; // Main type, e.g., 'text', 'select', 'textarea', 'checkbox', 'button', 'radio-group', 'date-picker'
  label: string; // User-visible label

  // Common Vuetify/HTML properties
  value?: any; // Default/initial value of the element
  placeholder?: string;
  hint?: string; // Helper text displayed below the input
  required?: boolean; // Simple boolean for HTML5 required or v-input required rule
  disabled?: boolean;
  readonly?: boolean;
  name?: string; // HTML name attribute, useful for non-JS form submission or specific integrations
  specificType?: string; // For v-text-field: 'text', 'number', 'email', 'password', 'tel', 'url', 'date', etc.
                         // For v-btn: 'button', 'submit', 'reset'

  // Layout and Styling
  height?: string | number; // e.g., for v-textarea
  width?: string | number; // Could be for columns or direct styling
  color?: string; // e.g. for v-btn

  // Data and Behavior
  options?: string[] | { text: string; value: any }[]; // For v-select, v-radio-group, v-combobox
  rules?: string[]; // Array of Vuetify validation rules (can be strings or functions in real app, strings for JSON)

  // Custom Metadata Properties (as per issue spec, using camelCase internally)
  variableName?: string; // Maps to 'nombreVariable'
  chapter?: string; // Maps to 'capitulo'
  question?: string; // Maps to 'pregunta'
  questionNumber?: string; // Maps to 'numeroPregunta'
  consistencyCondition?: string; // Maps to 'condicionConsistencia'
  inconsistencyMessage?: string; // Maps to 'mensajeInconsistencia'
  errorType?: 'Soft' | 'Hard' | string; // Maps to 'tipoError'
  description?: string; // Maps to 'descripcion'
  requirementLevel?: 'Required' | 'Optional' | 'Conditional' | string; // Maps to 'obligatoriedad'
  // Add any other custom fields from the spec if they are distinct
  // For example, if 'subType' is needed for more granular control within a 'type'
}

export interface FormBuilderState {
  formElements: FormElement[];
  selectedElementId: string | null;
}

export const useFormBuilderStore = defineStore('formBuilder', {
  state: (): FormBuilderState => ({
    formElements: [],
    selectedElementId: null,
  }),
  actions: {
    addElement(element: FormElement) {
      // Ensure element has a unique ID (simple implementation)
      if (!element.id) {
        element.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      }
      this.formElements.push(element);
    },
    removeElement(elementId: string) {
      this.formElements = this.formElements.filter(el => el.id !== elementId);
      if (this.selectedElementId === elementId) {
        this.selectedElementId = null;
      }
    },
    updateElement(updatedElement: FormElement) {
      const index = this.formElements.findIndex(el => el.id === updatedElement.id);
      if (index !== -1) {
        this.formElements[index] = updatedElement;
      }
    },
    setSelectedElement(elementId: string | null) {
      this.selectedElementId = elementId;
    },
    // Example of an action that might load initial data or reset the store
    initializeForm(elements: FormElement[]) {
      this.formElements = elements;
      this.selectedElementId = null;
    }
  },
  getters: {
    getElement: (state) => (elementId: string): FormElement | undefined => {
      return state.formElements.find(el => el.id === elementId);
    },
    getFormElements: (state): FormElement[] => {
      return state.formElements;
    },
    getSelectedElement: (state): FormElement | undefined => {
      if (state.selectedElementId) {
        return state.formElements.find(el => el.id === state.selectedElementId);
      }
      return undefined;
    },
  },
  persist: true, // Enable persistence for the entire store
})

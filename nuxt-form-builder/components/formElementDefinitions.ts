import type { FormElement } from '~/stores/formBuilderStore';

export interface AvailableElementDefinition {
  type: string;
  displayName: string;
  icon: string;
  defaultConfig: Omit<FormElement, 'id'>;
}

const commonDefaultConfig: Omit<FormElement, 'id' | 'type' | 'label'> = {
  value: '',
  placeholder: '',
  hint: '',
  required: false,
  disabled: false,
  readonly: false,
  name: '',
  height: undefined, // Or 'auto' for textarea
  width: undefined,
  rules: [],
  variableName: '',
  chapter: '',
  question: '',
  questionNumber: '',
  consistencyCondition: '',
  inconsistencyMessage: '',
  errorType: 'Soft',
  description: '',
  requirementLevel: 'Optional',
};

export const availableElements: AvailableElementDefinition[] = [
  {
    type: 'text',
    displayName: 'Text Input',
    icon: 'mdi-form-textbox',
    defaultConfig: {
      ...commonDefaultConfig,
      type: 'text',
      label: 'Text Input',
      placeholder: 'Enter text...',
      specificType: 'text', // Default for v-text-field
      variableName: 'textInputVar',
    },
  },
  {
    type: 'textarea',
    displayName: 'Text Area',
    icon: 'mdi-form-textarea',
    defaultConfig: {
      ...commonDefaultConfig,
      type: 'textarea',
      label: 'Text Area',
      placeholder: 'Enter multi-line text...',
      height: 3, // Default rows for textarea
      variableName: 'textAreaVar',
    },
  },
  {
    type: 'checkbox',
    displayName: 'Checkbox',
    icon: 'mdi-checkbox-marked-outline',
    defaultConfig: {
      ...commonDefaultConfig,
      type: 'checkbox',
      label: 'Checkbox Label',
      value: false, // Checkboxes usually have a boolean value
      variableName: 'checkboxVar',
      // 'required' for a single checkbox means it must be checked.
    },
  },
  {
    type: 'select',
    displayName: 'Dropdown Select',
    icon: 'mdi-form-dropdown',
    defaultConfig: {
      ...commonDefaultConfig,
      type: 'select',
      label: 'Select Option',
      placeholder: 'Choose an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      value: undefined, // Default selected value
      variableName: 'selectVar',
    },
  },
  {
    type: 'button',
    displayName: 'Button',
    icon: 'mdi-gesture-tap-button',
    defaultConfig: {
      // Buttons have fewer common fields, customize as needed
      type: 'button',
      label: 'Click Me', // Button text
      color: 'primary',
      specificType: 'button', // HTML button type attribute
      // Remove fields not applicable to buttons or set to undefined explicitly
      value: undefined,
      placeholder: undefined,
      hint: undefined,
      required: undefined,
      name: undefined,
      height: undefined,
      width: undefined,
      rules: undefined,
      variableName: 'buttonVar', // May not always be relevant for a button
      chapter: undefined,
      question: undefined,
      questionNumber: undefined,
      consistencyCondition: undefined,
      inconsistencyMessage: undefined,
      errorType: undefined,
      description: 'A clickable button.',
      requirementLevel: undefined,
      options: undefined,
    },
  },
  // Example: Radio Group
  {
    type: 'radio-group',
    displayName: 'Radio Group',
    icon: 'mdi-radiomarkers',
    defaultConfig: {
      ...commonDefaultConfig,
      type: 'radio-group',
      label: 'Choose an option',
      options: [
        { text: 'Option A', value: 'A' },
        { text: 'Option B', value: 'B' },
      ],
      value: undefined, // Default selected radio value
      variableName: 'radioGroupVar',
      rules: [], // Can add 'required' rule equivalent here
    },
  },
  // Example: Date Picker
  {
    type: 'date-picker',
    displayName: 'Date Picker',
    icon: 'mdi-calendar',
    defaultConfig: {
      ...commonDefaultConfig,
      type: 'date-picker',
      label: 'Select Date',
      placeholder: 'YYYY-MM-DD',
      variableName: 'datePickerVar',
      // value can be string in 'YYYY-MM-DD' format or Date object depending on component
    },
  }
];

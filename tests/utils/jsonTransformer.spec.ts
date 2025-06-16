import { describe, it, expect } from 'vitest';
import { transformFormElementsToJson } from '~/utils/jsonTransformer';
import type { FormElement } from '~/stores/formBuilderStore';

describe('transformFormElementsToJson', () => {
  it('should return an empty array if formElements is empty', () => {
    expect(transformFormElementsToJson([])).toEqual([]);
  });

  it('should correctly map FormElement fields to specified JSON keys', () => {
    const formElements: FormElement[] = [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        value: 'John Doe',
        variableName: 'fullNameVar',
        placeholder: 'Enter your full name',
        hint: 'Include middle names',
        requirementLevel: 'Required',
        chapter: '1',
        question: 'What is your name?',
        questionNumber: '1.1',
        consistencyCondition: 'this.age > 18',
        inconsistencyMessage: 'Must be an adult',
        errorType: 'Hard',
        description: 'Standard name input',
        rules: ['required', 'minLength:3'],
        name: 'fullNameField',
        disabled: false,
        readonly: false,
        specificType: 'text',
      },
    ];

    const result = transformFormElementsToJson(formElements);
    expect(result.length).toBe(1);
    const el = result[0];

    expect(el.id).toBe('1');
    expect(el.tipo).toBe('text');
    expect(el.etiqueta).toBe('Full Name');
    expect(el.valor).toBe('John Doe');
    expect(el.nombreVariable).toBe('fullNameVar');
    expect(el.placeholder).toBe('Enter your full name');
    expect(el.textoAyuda).toBe('Include middle names');
    expect(el.obligatoriedad).toBe('Required');
    expect(el.capitulo).toBe('1');
    expect(el.pregunta).toBe('What is your name?');
    expect(el.numeroPregunta).toBe('1.1');
    expect(el.condicionConsistencia).toBe('this.age > 18');
    expect(el.mensajeInconsistencia).toBe('Must be an adult');
    expect(el.tipoError).toBe('Hard');
    expect(el.descripcion).toBe('Standard name input');
    expect(el.reglas).toEqual(['required', 'minLength:3']);
    expect(el.nombre).toBe('fullNameField');
    expect(el.deshabilitado).toBe(false);
    expect(el.soloLectura).toBe(false);
    expect(el.subtipo).toBe('text');
  });

  it('should handle missing optional fields gracefully', () => {
    const formElements: FormElement[] = [
      {
        id: '2',
        type: 'textarea',
        label: 'Comments',
        // Most optional fields are missing
        variableName: 'commentsVar',
        required: true, // Test boolean conversion if any (currently direct map)
      },
    ];
    const result = transformFormElementsToJson(formElements);
    expect(result.length).toBe(1);
    const el = result[0];

    expect(el.id).toBe('2');
    expect(el.tipo).toBe('textarea');
    expect(el.etiqueta).toBe('Comments');
    expect(el.nombreVariable).toBe('commentsVar');
    // expect(el.required).toBe(true); // 'required' field not in final JSON spec, 'obligatoriedad' is
    expect(el.obligatoriedad).toBeUndefined(); // As requirementLevel was not provided
    expect(el.placeholder).toBeUndefined(); // Example of a missing optional field
    expect(el.textoAyuda).toBeUndefined();
    expect(el.valor).toBeUndefined(); // default value not provided
  });

  it('should include options for select and radio-group types', () => {
    const formElements: FormElement[] = [
      {
        id: '3',
        type: 'select',
        label: 'Country',
        options: [{text: 'USA', value: 'us'}, {text: 'Canada', value: 'ca'}],
      },
    ];
    const result = transformFormElementsToJson(formElements);
    expect(result[0].opciones).toEqual([{text: 'USA', value: 'us'}, {text: 'Canada', value: 'ca'}]);
  });

  it('should include height for textarea if defined', () => {
    const formElements: FormElement[] = [
      { id: '4', type: 'textarea', label: 'Essay', height: 5 },
    ];
    const result = transformFormElementsToJson(formElements);
    expect(result[0].altura).toBe(5);
  });

  it('should include color for button if defined', () => {
    const formElements: FormElement[] = [
        {id: '5', type: 'button', label: 'Submit', color: 'primary'}
    ];
    const result = transformFormElementsToJson(formElements);
    expect(result[0].color).toBe('primary');
  });

  it('should remove undefined, null, or empty array properties, but keep empty strings and false booleans', () => {
    const formElements: FormElement[] = [
      {
        id: '6',
        type: 'text',
        label: 'Test Empty',
        value: '', // Keep empty string
        placeholder: undefined,
        hint: null,
        rules: [], // Remove empty array
        disabled: false, // Keep false boolean
        variableName: 'testEmptyVar'
      },
    ];
    const result = transformFormElementsToJson(formElements);
    const el = result[0];
    expect(el.valor).toBe('');
    expect(el.deshabilitado).toBe(false);
    expect(el).not.toHaveProperty('placeholder');
    expect(el).not.toHaveProperty('hint');
    expect(el).not.toHaveProperty('reglas');
    expect(el.nombreVariable).toBe('testEmptyVar');
  });
});

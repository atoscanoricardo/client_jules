import type { FormElement } from '~/stores/formBuilderStore';

export function transformFormElementsToJson(formElements: FormElement[]): Record<string, any>[] {
  return formElements.map(el => {
    const outputEl: Record<string, any> = {
      // Ensure all keys from the spec are considered
      id: el.id, // Keep internal ID for reference during development/testing if needed
      tipo: el.type,
      etiqueta: el.label,
      valor: el.value, // Default or current value
      nombreVariable: el.variableName,
      placeholder: el.placeholder,
      textoAyuda: el.hint,
      obligatoriedad: el.requirementLevel,
      capitulo: el.chapter,
      pregunta: el.question,
      numeroPregunta: el.questionNumber,
      condicionConsistencia: el.consistencyCondition,
      mensajeInconsistencia: el.inconsistencyMessage,
      tipoError: el.errorType,
      descripcion: el.description,
      reglas: el.rules,
      nombre: el.name, // HTML name attribute
      deshabilitado: el.disabled,
      soloLectura: el.readonly,
      subtipo: el.specificType, // For v-text-field's type: 'text', 'number', etc.
                               // Or for v-btn type: 'button', 'submit'
      // altura: el.height, // Only add if defined, see below
      // color: el.color, // Only add if defined, see below
      // opciones: el.options // Only add if defined, see below
    };

    // Add type-specific or conditional properties
    if (el.type === 'select' || el.type === 'radio-group') {
      outputEl.opciones = el.options;
    }
    if (el.type === 'textarea' && el.height) {
      outputEl.altura = el.height;
    }
    if (el.type === 'button' && el.color) {
      outputEl.color = el.color;
    }
    // Add other conditional properties from FormElement if they exist

    // Remove undefined/null properties or empty arrays for cleaner JSON,
    // but keep empty strings and boolean 'false'
    Object.keys(outputEl).forEach(key => {
      const val = outputEl[key];
      if (val === undefined || val === null || (Array.isArray(val) && val.length === 0)) {
        // Exception: allow empty string '' and boolean false
        if (val !== '' && val !== false) {
          delete outputEl[key];
        }
      }
    });
    return outputEl;
  });
}

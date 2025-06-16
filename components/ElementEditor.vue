<template>
  <v-dialog :model-value="!!selectedElement" @update:model-value="handleDialogClose" persistent max-width="800px" scrollable>
    <v-card v-if="selectedElement && editableElement" class="element-editor-card">
      <v-card-title class="d-flex justify-space-between align-center headline-bar">
        <span class="text-h6 font-weight-medium">Edit: {{ editableElement.label || editableElement.type }}</span>
        <v-btn icon="mdi-close" variant="text" @click="closeEditor" title="Close editor"></v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-tabs v-model="currentTab" color="primary" grow class="editor-tabs">
          <v-tab value="general" :slim="true">General</v-tab>
          <v-tab value="behavior" :slim="true">Behavior & Validation</v-tab>
          <v-tab value="metadata" :slim="true">Metadata</v-tab>
          <v-tab value="advanced" :slim="true">Advanced</v-tab>
        </v-tabs>
        <v-divider></v-divider>

        <v-window v-model="currentTab" class="pa-4 tab-content-window">
          <v-window-item value="general" class="tab-pane">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.label" label="Label" hint="Visible label for the field." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.variableName" label="Variable Name" hint="Unique ID for data/logic (e.g., nombreVariable)." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.placeholder" label="Placeholder" hint="Placeholder text." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.hint" label="Hint / Helper Text" hint="Small text under input." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.value" label="Default Value" hint="Initial value." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6" v-if="editableElement.type === 'text'">
                <v-select
                  v-model="editableElement.specificType"
                  :items="['text', 'number', 'email', 'password', 'tel', 'url', 'date']"
                  label="Input Type"
                  hint="HTML input type (for text fields)."
                  persistent-hint density="compact" variant="filled"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6" v-if="editableElement.type === 'textarea'">
                <v-text-field type="number" v-model.number="editableElement.height" label="Height (rows)" hint="Number of rows for textarea." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6" v-if="editableElement.type === 'button'">
                <v-text-field v-model="editableElement.color" label="Button Color" hint="e.g., primary, success, #FF0000" persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="behavior" class="tab-pane">
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-switch v-model="editableElement.required" label="Required" color="primary" density="compact" inset></v-switch>
              </v-col>
              <v-col cols="12" sm="4">
                <v-switch v-model="editableElement.disabled" label="Disabled" color="primary" density="compact" inset></v-switch>
              </v-col>
              <v-col cols="12" sm="4">
                <v-switch v-model="editableElement.readonly" label="Read-only" color="primary" density="compact" inset></v-switch>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="rulesText"
                  label="Validation Rules (comma-separated)"
                  hint="e.g., required,email,minLength:5. For Vuetify, these map to functions."
                  persistent-hint rows="2" density="compact" variant="filled"
                ></v-textarea>
              </v-col>
              <template v-if="editableElement.type === 'select' || editableElement.type === 'radio-group'">
                <v-col cols="12">
                  <v-textarea
                    v-model="selectItemsText"
                    :label="editableElement.type === 'select' ? 'Dropdown Options (one per line)' : 'Radio Options (one per line)'"
                    hint="Format: Item Label or value|Item Label. If only value, it's used as label too."
                    persistent-hint rows="3" density="compact" variant="filled"
                  ></v-textarea>
                </v-col>
              </template>
            </v-row>
          </v-window-item>

          <v-window-item value="metadata" class="tab-pane">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.chapter" label="Chapter (capitulo)" density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.questionNumber" label="Question Number (numeroPregunta)" density="compact" variant="filled"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editableElement.question" label="Question Text (pregunta)" rows="2" density="compact" variant="filled"></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editableElement.description" label="Description (descripcion)" hint="Internal notes." persistent-hint rows="2" density="compact" variant="filled"></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editableElement.requirementLevel"
                  :items="['Required', 'Optional', 'Conditional']"
                  label="Requirement Level (obligatoriedad)"
                  hint="Semantic requirement level."
                  persistent-hint density="compact" variant="filled"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editableElement.name" label="HTML Name Attribute" hint="For form submissions (name)." persistent-hint density="compact" variant="filled"></v-text-field>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="advanced" class="tab-pane">
            <v-row dense>
              <v-col cols="12">
                <v-textarea v-model="editableElement.consistencyCondition" label="Consistency Condition (condicionConsistencia)" rows="2" density="compact" hint="Logic for consistency checks." variant="filled"></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editableElement.inconsistencyMessage" label="Inconsistency Message (mensajeInconsistencia)" rows="2" density="compact" hint="Message if check fails." variant="filled"></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editableElement.errorType"
                  :items="['Soft', 'Hard']"
                  label="Error Type (tipoError)"
                  hint="Severity of inconsistency."
                  persistent-hint density="compact" variant="filled"
                ></v-select>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-3 editor-actions">
        <v-btn color="grey-darken-1" variant="text" @click="closeEditor">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="elevated" @click="saveChanges" prepend-icon="mdi-content-save">Save Changes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useFormBuilderStore, type FormElement } from '~/stores/formBuilderStore';

const store = useFormBuilderStore();
const selectedElement = computed(() => store.getSelectedElement);
const editableElement = ref<FormElement | null>(null);
const currentTab = ref('general');

const selectItemsText = ref('');
const rulesText = ref('');

watch(selectedElement, (newVal) => {
  if (newVal) {
    editableElement.value = JSON.parse(JSON.stringify(newVal));
    if (Array.isArray(editableElement.value?.options)) {
      selectItemsText.value = editableElement.value!.options.map(opt => {
        if (typeof opt === 'string') return opt;
        return `${opt.value}|${opt.text}`;
      }).join('\n');
    } else { selectItemsText.value = ''; }

    if (Array.isArray(editableElement.value?.rules)) {
      rulesText.value = editableElement.value!.rules.join(',');
    } else { rulesText.value = ''; }
    currentTab.value = 'general';
  } else { editableElement.value = null; }
}, { deep: true, immediate: true });

const handleDialogClose = (value: boolean) => { if (!value) closeEditor(); };
const closeEditor = () => {
  store.setSelectedElement(null);
  editableElement.value = null;
};

const saveChanges = () => {
  if (!editableElement.value) return;
  if (editableElement.value.type === 'select' || editableElement.value.type === 'radio-group') {
    editableElement.value.options = selectItemsText.value.split('\n').map(line => line.trim()).filter(line => line)
      .map(line => {
        const parts = line.split('|');
        if (parts.length === 2) return { value: parts[0].trim(), text: parts[1].trim() };
        return { value: line, text: line };
      });
  }
  editableElement.value.rules = rulesText.value.split(',').map(r => r.trim()).filter(r => r);
  store.updateElement(JSON.parse(JSON.stringify(editableElement.value)));
};
</script>

<style scoped>
.element-editor-card {
  border-radius: 8px; /* More modern rounded corners */
}
.headline-bar {
  background-color: #f5f5f5; /* Light grey for title bar */
  padding: 12px 16px;
}
.editor-tabs {
  border-bottom: 1px solid #e0e0e0; /* Separator for tabs */
}
.tab-content-window {
  /* The pa-4 class is already applied to the v-window */
}
.tab-pane { /* Each v-window-item */
  padding-top: 12px; /* Add some top padding inside tab panes */
}

.v-card-text { /* This is the main scrollable area */
 /* pa-0 was set, so children need padding */
}
.editor-actions {
  background-color: #f9f9f9; /* Light background for actions */
  border-top: 1px solid #e0e0e0;
}

/* Ensure switches have enough space */
.v-switch {
  margin-top: 4px;
  margin-bottom: 4px;
}
</style>

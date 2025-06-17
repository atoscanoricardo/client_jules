<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="$vuetify.display.mobile"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Dynamic Form Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- Add any app bar actions here if needed -->
    </v-app-bar>

    <!-- Navigation Drawer (Optional, for mobile or future use) -->
    <v-navigation-drawer
      app
      v-model="drawer"
      temporary
      v-if="$vuetify.display.mobile"
    >
      <!-- Drawer content can be similar to AvailableElements or other navigation -->
      <AvailableElements class="pa-2" />
    </v-navigation-drawer>

    <v-main class="app-main-content">
      <v-container fluid class="pa-4">
        <v-row>
          <!-- Available Elements Column (hidden on mobile if drawer is used) -->
          <v-col
            cols="12"
            md="4"
            class="available-elements-col"
            v-if="!$vuetify.display.mobile"
          >
            <AvailableElements />
          </v-col>

          <!-- Form Builder Canvas and JSON Output Column -->
          <v-col
            cols="12"
            :md="$vuetify.display.mobile ? 12 : 8"
            class="form-builder-col"
          >
            <v-card
              class="drop-zone mb-4 pa-2"
              :class="{ 'drag-over': isDragOver }"
              @dragover.prevent="handleDragOver"
              @dragleave="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <v-card-title>Form Builder Canvas</v-card-title>
              <v-card-text>
                <p
                  v-if="
                    formBuilderStore.formElements.length === 0 && !isDragOver
                  "
                  class="empty-form-message"
                >
                  Drag elements here or use the panel to add them.
                </p>
                <p v-if="isDragOver" class="drop-prompt-message">
                  Drop here to add the element.
                </p>

                <div
                  v-if="formBuilderStore.formElements.length > 0"
                  class="elements-list mt-3"
                >
                  <!-- Removed "Elements in form (Click to edit):" title as items are self-explanatory -->
                  <ul>
                    <li
                      v-for="element in formBuilderStore.formElements"
                      :key="element.id"
                      class="form-element-item pa-3"
                      :class="{
                        'selected-element':
                          formBuilderStore.selectedElementId === element.id,
                      }"
                      @click="selectElementForEditing(element.id)"
                    >
                      <v-icon
                        :icon="getElementIcon(element.type)"
                        class="mr-3"
                      ></v-icon>
                      <span class="element-label"
                        >{{ element.label || "Unnamed Element" }} ({{
                          element.type
                        }})</span
                      >
                      <div class="element-actions">
                        <v-btn
                          size="small"
                          variant="text"
                          color="primary"
                          @click.stop="selectElementForEditing(element.id)"
                          title="Edit Element"
                          icon="mdi-pencil-outline"
                        ></v-btn>
                        <!-- Changed to text variant for less clutter -->
                        <v-btn
                          size="small"
                          variant="text"
                          color="error"
                          @click.stop="removeElement(element.id)"
                          title="Remove Element"
                          icon="mdi-delete-outline"
                        ></v-btn>
                        <!-- Changed to text variant -->
                      </div>
                    </li>
                  </ul>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mt-4 json-output-card">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Generated Form JSON</span>
                <v-btn
                  color="secondary"
                  @click="copyJsonToClipboard"
                  prepend-icon="mdi-content-copy"
                >
                  Copy JSON
                </v-btn>
              </v-card-title>
              <v-card-text class="pa-2">
                <v-textarea
                  :model-value="transformedFormJsonString"
                  label="Form JSON Output"
                  readonly
                  auto-grow
                  rows="10"
                  density="compact"
                  class="json-output-textarea"
                ></v-textarea>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <ElementEditor />
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        location="top right"
      >
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  useFormBuilderStore,
  type FormElement,
} from "~/stores/formBuilderStore";
import AvailableElements from "~/components/AvailableElements.vue";
import ElementEditor from "~/components/ElementEditor.vue";
import { availableElements as elementDefinitions } from "~/components/formElementDefinitions"; // Removed AvailableElementDefinition type import
import { transformFormElementsToJson } from "~/utils/jsonTransformer"; // Import the new utility

const formBuilderStore = useFormBuilderStore();
const isDragOver = ref(false);
const drawer = ref(false); // For mobile navigation drawer

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
  timeout: 3000,
});

const getElementIcon = (elementType: string): string => {
  const def = elementDefinitions.find((d) => d.type === elementType);
  return def ? def.icon : "mdi-help-box";
};

const selectElementForEditing = (elementId: string) => {
  formBuilderStore.setSelectedElement(elementId);
};

const removeElement = (elementId: string) => {
  formBuilderStore.removeElement(elementId);
  if (formBuilderStore.selectedElementId === elementId) {
    formBuilderStore.setSelectedElement(null);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  if (event.dataTransfer) {
    const rawData = event.dataTransfer.getData("application/json");
    try {
      const { type: elementType } = JSON.parse(rawData) as { type: string };
      const elementDef = elementDefinitions.find(
        (def) => def.type === elementType
      );
      if (elementDef) {
        const newElement: FormElement = {
          ...JSON.parse(JSON.stringify(elementDef.defaultConfig)),
          id: generateUniqueId(),
          type: elementDef.type,
        };
        formBuilderStore.addElement(newElement);
      } else {
        console.error("Dropped element type not found:", elementType);
      }
    } catch (e) {
      console.error("Failed to parse dropped data:", e);
    }
  }
};

const generateUniqueId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const transformedFormJson = computed(() => {
  return formBuilderStore.formElements.map((el) => {
    const outputEl: Record<string, any> = {
      id: el.id,
      tipo: el.type,
      etiqueta: el.label,
      valor: el.value,
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
      nombre: el.name,
      deshabilitado: el.disabled,
      soloLectura: el.readonly,
      subtipo: el.specificType, // For text field's type like 'number', 'email'
    };
    if (el.type === "select" || el.type === "radio-group") {
      outputEl.opciones = el.options;
    }
    if (el.type === "textarea" && el.height) {
      outputEl.altura = el.height;
    }
    if (el.type === "button" && el.color) {
      outputEl.color = el.color;
    }

    Object.keys(outputEl).forEach((key) => {
      if (
        outputEl[key] === undefined ||
        outputEl[key] === null ||
        (Array.isArray(outputEl[key]) && outputEl[key].length === 0)
      ) {
        if (outputEl[key] !== "" && outputEl[key] !== false) {
          // Keep empty strings and false booleans
          delete outputEl[key];
        }
      }
    });
    return outputEl;
  });
});

const transformedFormJsonString = computed(() =>
  JSON.stringify(transformedFormJson.value, null, 2)
);

const copyJsonToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(transformedFormJsonString.value);
    snackbar.value = {
      show: true,
      text: "JSON copied to clipboard!",
      color: "success",
      timeout: 3000,
    };
  } catch (err) {
    console.error("Failed to copy JSON: ", err);
    snackbar.value = {
      show: true,
      text: "Failed to copy JSON.",
      color: "error",
      timeout: 3000,
    };
  }
};
</script>

<style scoped>
.app-main-content {
  background-color: #f7f8fc; /* Light background for the main content area */
}
.available-elements-col {
  /* background-color: #fff; Card inside will handle its own bg */
  /* border-right: 1px solid #e0e0e0; */
  height: calc(100vh - 64px); /* Full height minus app-bar */
  overflow-y: auto;
  position: sticky; /* Make it sticky */
  top: 64px; /* Height of the app-bar */
}
.form-builder-col {
  /* background-color: #fff; */
}

.drop-zone {
  border: 2px dashed #bdbdbd; /* Subtler dash */
  padding: 16px; /* Vuetify pa-4 equivalent */
  min-height: 250px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  background-color: #fff;
}
.drop-zone.drag-over {
  background-color: #e3f2fd;
  border-color: #2196f3;
} /* Lighter blue, primary border */

.empty-form-message,
.drop-prompt-message {
  text-align: center;
  color: #757575;
  font-style: italic;
  margin-top: 20px;
  padding: 10px;
}

.elements-list {
  margin-top: 15px;
}
.form-element-item {
  margin-bottom: 12px; /* Increased spacing */
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px; /* Standard border-radius */
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Softer shadow */
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease,
    border-left 0.2s ease;
  border-left: 4px solid transparent; /* For selection indication */
}
.form-element-item:hover {
  background-color: #f5f5f5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.form-element-item.selected-element {
  border-left: 4px solid #1976d2; /* Vuetify primary blue */
  background-color: #e3f2fd; /* Light blue background for selected */
}
.element-label {
  flex-grow: 1;
  font-size: 0.9rem;
} /* Slightly smaller label */
.element-actions {
  display: flex;
  align-items: center;
}

.json-output-card {
  background-color: #fff;
}
.json-output-textarea .v-textarea__slot textarea {
  font-family: "Roboto Mono", monospace !important; /* Consistent monospace */
  font-size: 0.8rem !important; /* Slightly smaller for more content */
  line-height: 1.4 !important;
}

ul {
  list-style-type: none;
  padding-left: 0;
}
</style>

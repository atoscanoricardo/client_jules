<template>
  <v-card elevation="2" class="available-elements-card">
    <v-card-title class="text-subtitle-1 font-weight-medium pa-3">
      Available Elements
    </v-card-title>
    <v-divider></v-divider>
    <v-list nav density="compact">
      <v-list-item
        v-for="elementDef in availableElements"
        :key="elementDef.type"
        :draggable="true"
        @dragstart="handleDragStart(elementDef, $event)"
        @click="addElementByClick(elementDef)"
        link
        class="draggable-element-item"
        :title="`Drag or click to add ${elementDef.displayName}`"
      >
        <template v-slot:prepend>
          <v-icon :icon="elementDef.icon" class="mr-3"></v-icon>
        </template>
        <v-list-item-title class="text-body-2">{{ elementDef.displayName }}</v-list-item-title>
        <template v-slot:append>
          <v-btn
            size="x-small"
            variant="outlined"
            color="grey-darken-1"
            icon="mdi-plus"
            @click.stop="addElementByClick(elementDef)"
            title="Add to form"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { useFormBuilderStore } from '~/stores/formBuilderStore';
import { availableElements, type AvailableElementDefinition } from './formElementDefinitions';
import type { FormElement } from '~/stores/formBuilderStore';

const formBuilderStore = useFormBuilderStore();

const addElementByClick = (elementDef: AvailableElementDefinition) => {
  const newElementConfig = JSON.parse(JSON.stringify(elementDef.defaultConfig));
  const newElement: FormElement = {
    ...newElementConfig,
    id: generateUniqueId(),
    type: elementDef.type,
  };
  formBuilderStore.addElement(newElement);
};

const handleDragStart = (elementDef: AvailableElementDefinition, event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: elementDef.type }));
    event.dataTransfer.effectAllowed = 'copy';
  }
  // console.log(`Dragging: ${elementDef.displayName}`); // Keep for debugging if needed
};

const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};
</script>

<style scoped>
.available-elements-card {
  border-radius: 8px; /* Slightly more rounded corners for the card */
}
.v-list-item {
  /* border-bottom: 1px solid #f0f0f0; */ /* Removing individual borders for a cleaner look with nav list */
  padding-top: 10px;
  padding-bottom: 10px;
  cursor: grab;
  transition: background-color 0.2s ease-in-out;
}
.v-list-item:not(:last-child) {
  border-bottom: 1px solid #eeeeee; /* subtle separator */
}

.v-list-item:hover {
  background-color: #e9f5ff; /* A light blue hover, adjust to theme */
}
.draggable-element-item:active {
  cursor: grabbing;
  background-color: #dcf0ff; /* Slightly darker on active drag */
}
.v-list-item-title {
  line-height: 1.4;
}
</style>

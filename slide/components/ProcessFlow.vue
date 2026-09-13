<script setup>
import * as constants from '@//constants'

defineProps({
  steps: {
    type: Array,
    required: true,
  },
  noteTitle: String,
  note: String,
})
</script>

<template>
  <div class="process-flow">
    <div class="process-flow__steps">
      <template v-for="(step, index) in steps" :key="step.label">
        <article class="process-flow__step">
          <p class="process-flow__label">{{ step.label }}</p>
          <h3>{{ step.title }}</h3>
          <p class="process-flow__description">{{ step.description }}</p>
          <p class="process-flow__technology">{{ step.technology }}</p>
        </article>
        <div v-if="index < steps.length - 1" class="process-flow__arrow" aria-hidden="true">→</div>
      </template>
    </div>

    <aside v-if="noteTitle || note" class="process-flow__note">
      <strong v-if="noteTitle">{{ noteTitle }}</strong>
      <span v-if="note">{{ note }}</span>
    </aside>
  </div>
</template>

<style scoped>
.process-flow {
  margin-top: 1.5rem;
}

.process-flow__steps {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 1rem;
  align-items: stretch;
}

.process-flow__step {
  display: flex;
  min-height: 13rem;
  box-sizing: border-box;
  flex-direction: column;
  padding: 1.25rem;
  border-top: 0.35rem solid v-bind("constants.COLOR_PRIMARY");
  background: v-bind("constants.COLOR_CODE");
}

.process-flow__step p {
  margin: 0;
}

.process-flow__label {
  color: v-bind("constants.COLOR_PRIMARY") !important;
  font-size: 0.85rem !important;
}

.process-flow__step h3 {
  margin: 0.7rem 0;
  color: v-bind("constants.COLOR_TEXT");
  font-size: 1.2rem;
  line-height: 1.4;
}

.process-flow__description {
  color: v-bind("constants.COLOR_TEXT") !important;
  font-size: 0.9rem !important;
  font-weight: 400 !important;
  line-height: 1.45 !important;
}

.process-flow__technology {
  margin-top: auto !important;
  padding-top: 0.75rem;
  color: v-bind("constants.COLOR_PRIMARY") !important;
  font-size: 0.78rem !important;
}

.process-flow__arrow {
  align-self: center;
  color: v-bind("constants.COLOR_PRIMARY");
  font-size: 1.6rem;
  font-weight: v-bind("constants.FONT_WEIGHT_BOLD");
}

.process-flow__note {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  margin-top: 1.25rem;
  padding: 0.8rem 1rem;
  border-left: 0.35rem solid v-bind("constants.COLOR_PRIMARY");
  background: v-bind("constants.COLOR_CODE");
  color: v-bind("constants.COLOR_TEXT");
}

.process-flow__note strong {
  flex: none;
  color: v-bind("constants.COLOR_PRIMARY");
}

.process-flow__note span {
  font-size: 0.9rem;
  font-weight: v-bind("constants.FONT_WEIGHT_BOLD");
}
</style>

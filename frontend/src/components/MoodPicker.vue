<template>
  <div class="mood-picker">
    <div class="mood-grid">
      <button
        v-for="option in MOOD_OPTIONS"
        :key="option.emoji"
        :class="['mood-option', { selected: selectedMood === option.emoji }]"
        @click="selectMood(option.emoji)"
      >
        <span class="mood-emoji">{{ option.emoji }}</span>
        <span class="mood-label">{{ option.label }}</span>
      </button>
    </div>
    
    <div v-if="selectedMood" class="mood-note">
      <input
        v-model="note"
        type="text"
        class="input"
        placeholder="说点什么..."
        maxlength="50"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  noteValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:noteValue'])

const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' },
  { emoji: '😢', label: '难过' },
  { emoji: '😡', label: '生气' },
  { emoji: '😴', label: '疲惫' },
  { emoji: '🤔', label: '思考' },
  { emoji: '🥰', label: '甜蜜' },
  { emoji: '😰', label: '焦虑' },
  { emoji: '😤', label: '委屈' }
]

const selectedMood = ref(props.modelValue)
const note = ref(props.noteValue)

watch(selectedMood, (val) => {
  emit('update:modelValue', val)
})

watch(note, (val) => {
  emit('update:noteValue', val)
})

function selectMood(emoji) {
  selectedMood.value = emoji
}
</script>

<style scoped>
.mood-picker {
  width: 100%;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  background: var(--white);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mood-option:active {
  transform: scale(0.95);
}

.mood-option.selected {
  border-color: var(--female-primary);
  background: var(--female-bg);
}

.male-theme .mood-option.selected {
  border-color: var(--male-primary);
  background: var(--male-bg);
}

.mood-emoji {
  font-size: 32px;
}

.mood-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.mood-note {
  animation: slide-up 0.2s ease;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

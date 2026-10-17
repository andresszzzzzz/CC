<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '••••••••' },
  autocomplete: { type: String, default: 'current-password' },
  minlength: { type: [String, Number], default: undefined },
  required: { type: Boolean, default: true }
})
defineEmits(['update:modelValue'])

const visible = ref(false)
</script>

<template>
  <div class="pw-wrap">
    <input
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="pw-toggle"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :title="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      @click="visible = !visible"
    >
      <!-- ojo cerrado: la contraseña se está mostrando -->
      <svg v-if="visible" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <path d="m2 2 20 20" />
      </svg>
      <!-- ojo abierto: la contraseña está oculta -->
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.pw-wrap { position: relative; display: block; }
.pw-wrap input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 44px 12px 14px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
}
.pw-wrap input:focus { border-color: #2563eb; background: white; }
.pw-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
}
.pw-toggle:hover { color: #2563eb; background: #eff6ff; }
</style>

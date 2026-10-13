<script setup>

defineProps({
  hoverable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<template>
  <div
    class="rounded-xl border border-border bg-card text-card-foreground overflow-hidden"
    :class="hoverable && 'cursor-pointer transition-all hover:shadow-lg'"
    @click="hoverable && $emit('click', $event)"
  >
    <!-- Slot default: todo lo que va antes del footer -->
    <slot />

    <!-- Slot footer: separado con borde superior -->
    <div
      v-if="$slots.footer"
      class="border-t border-border px-4 py-3"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
<script setup>

defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'outline', 'ghost', 'destructive'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'icon'].includes(v),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium
           transition-colors focus-visible:outline-none focus-visible:ring-2
           focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    :class="{
      /* Variantes */
      'bg-primary text-primary-foreground hover:bg-primary/90':
        variant === 'default',
      'border border-border bg-transparent text-foreground hover:bg-muted':
        variant === 'outline',
      'bg-transparent text-foreground hover:bg-muted':
        variant === 'ghost',
      'bg-destructive text-white hover:bg-destructive/90':
        variant === 'destructive',
      /* Tamaños */
      'h-8 px-3 text-xs':            size === 'sm',
      'h-10 px-4 text-sm':           size === 'md',
      'h-12 px-6 text-base':         size === 'lg',
      'h-10 w-10 p-0':               size === 'icon',
    }"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
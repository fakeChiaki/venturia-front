<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'secondary', 'outline', 'destructive', 'active'].includes(v),
  },
})
</script>
<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
    :class="{
      'bg-primary text-primary-foreground':                    variant === 'default',
      'bg-muted text-muted-foreground':                        variant === 'secondary',
      'border border-border text-foreground bg-transparent':   variant === 'outline',
      'bg-destructive text-white':                             variant === 'destructive',
      'bg-[#8B5A2B] text-white border border-[#8B5A2B]':      variant === 'active',
    }"
  >
    <slot />
  </span>
</template>
<script setup>
import Navbar from './components/layout/navbar.vue'
import AppFooter from './components/layout/footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FAF8F5] font-sans text-[#1C1917]">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
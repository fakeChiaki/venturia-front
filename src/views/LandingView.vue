<script setup>
const stats = [
  { value: '1.200+', label: 'Perfiles técnicos activos' },
  { value: '340+', label: 'Proyectos publicados' },
  { value: '92%', label: 'Satisfacción de match' },
]

const projects = [
  {
    id: 1,
    status: 'Activo',
    category: 'FINTECH',
    title: 'Plataforma de pagos B2B',
    desc: 'Buscan Frontend y Backend developer para sprint de cierre de ronda seed.',
    meta: 'Remoto · Scrum',
    affinity: '88% afín',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    status: 'Activo',
    category: 'AGROINDUSTRIA',
    title: 'Monitoreo de cultivos con IoT',
    desc: 'Equipo de investigación aplicada busca Data Scientist con experiencia en sensores.',
    meta: 'Temuco · Híbrido',
    affinity: '76% afín',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    status: 'Por cerrar',
    category: 'EDUCACIÓN',
    title: 'App de tutorías entre pares',
    desc: 'Startup universitaria busca UX/UI Designer para validar prototipo.',
    meta: 'Remoto · Kanban',
    affinity: '81% afín',
    image: 'https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?auto=format&fit=crop&w=800&q=80'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] font-sans text-[#1C1917]">

    <!-- Hero -->
    <section class="text-center pt-16 pb-12 px-4">
      <div class="inline-flex items-center bg-[#F3E9D3] text-[#8B5A2B] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
        Donde el talento encuentra su próxima aventura
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
        Conecta con proyectos que valen la<br class="hidden md:block"> pena arriesgar
      </h1>
      <p class="text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
        Venturia conecta talento técnico especializado con empresas y fundadores que construyen lo que sigue.
        Afinidad real, coordinación automática, cero fricción.
      </p>
      <div class="flex items-center justify-center gap-4">
        <router-link to="/projects" class="bg-[#8B5A2B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6B4423] transition-colors shadow-sm">
          Explorar proyectos
        </router-link>
        <router-link to="/projects/new" class="bg-[#8B5A2B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6B4423] transition-colors shadow-sm">
          Publicar un proyecto
        </router-link>
      </div>
    </section>

    <!-- Proyectos destacados -->
    <section class="max-w-7xl mx-auto px-6 pb-20">
      <h3 class="text-center text-sm font-bold tracking-widest uppercase text-[#1C1917] mb-10">
        Proyectos destacados esta semana
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="p in projects"
          :key="p.id"
          class="bg-white rounded-2xl overflow-hidden border border-[#E5E0D8] shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="relative h-48">
            <img :src="p.image" class="w-full h-full object-cover" :alt="p.title">
            <span :class="['absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full', p.status === 'Activo' ? 'bg-white text-green-700' : 'bg-[#8B5A2B] text-white']">
              {{ p.status }}
            </span>
          </div>
          <div class="p-5">
            <p class="text-xs font-bold text-[#8B5A2B] tracking-wider uppercase mb-2">{{ p.category }}</p>
            <h4 class="font-bold text-lg mb-2">{{ p.title }}</h4>
            <p class="text-sm text-gray-600 mb-4 leading-relaxed">{{ p.desc }}</p>
            <div class="flex items-center justify-between text-xs border-t border-[#E5E0D8] pt-4">
              <span class="text-gray-600">{{ p.meta }}</span>
              <span class="font-bold text-[#8B5A2B]">{{ p.affinity }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-white border-t border-[#E5E0D8]">
      <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        <div v-for="s in stats" :key="s.label">
          <div class="text-4xl md:text-5xl font-extrabold mb-2">{{ s.value }}</div>
          <div class="text-gray-600">{{ s.label }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
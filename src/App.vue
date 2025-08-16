<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <Sidebar
      :current-view="currentView"
      :open="sidebarOpen"
      :count-doctors="countDoctors"
      @navigate="setView"
    />

    <!-- Main -->
    <div class="main">
      <!-- Topbar -->
      <Topbar
        :page-title="pageTitle"
        :sidebar-open="sidebarOpen"
        :theme="theme"
        @toggleSidebar="sidebarOpen = !sidebarOpen"
        @toggleTheme="theme = theme === 'light' ? 'dark' : 'light'"
        @navigate="setView"
      />

      <!-- Content -->
      <main class="content">
        <!-- DASHBOARD VIEW -->
        <section v-if="currentView === 'home'" class="home">
          <div class="hero">
            <div>
              <h2>Your healthcare, accelerated</h2>
              <p>Search, call, and book with board-certified AI physicians across 17 specialties.</p>
              <div class="hero-actions">
                <button class="primary" @click="setView('doctors')">
                  <i class="fas fa-user-md"></i>
                  Browse AI Physicians
                </button>
                <button class="ghost" @click="setView('doctors')">
                  <i class="fas fa-bolt"></i>
                  Quick consult
                </button>
              </div>
            </div>
            <div class="hero-illustration">
              <i class="fas fa-headset"></i>
            </div>
          </div>

          <div class="stats">
            <div class="stat">
              <i class="fas fa-users"></i>
              <div>
                <strong>17</strong>
                <span>Available Doctors</span>
              </div>
            </div>
            <div class="stat">
              <i class="fas fa-check-circle"></i>
              <div>
                <strong>99.2%</strong>
                <span>Uptime</span>
              </div>
            </div>
            <div class="stat">
              <i class="fas fa-clock"></i>
              <div>
                <strong>~12s</strong>
                <span>Avg Connect Time</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3>Get started</h3>
            <ul>
              <li><i class="fas fa-search"></i> Use the search to find a specialty</li>
              <li><i class="fas fa-phone"></i> Click <em>Call</em> to start a voice session</li>
              <li><i class="fas fa-calendar"></i> Or book a <em>Consultation</em> slot</li>
            </ul>
          </div>
        </section>

        <!-- DOCTORS VIEW -->
        <section v-else-if="currentView === 'doctors'" class="doctors">
          <Suspense>
            <template #default>
              <VapiAssistant />
            </template>
            <template #fallback>
              <div class="loading-card">
                <div class="spinner"></div>
                Loading doctors…
              </div>
            </template>
          </Suspense>
        </section>
      </main>

      <!-- Footer -->
      <FooterBar
        appName="AI Doctors"
        company="Arslan"
        version="v1.0.0"
        status="operational"
        :links="[
          { label: 'Docs', href: '#', icon: 'fa-book' },
          { label: 'Status', href: '#', icon: 'fa-signal' },
          { label: 'Support', href: '#', icon: 'fa-life-ring' },
          { label: 'Privacy', href: '#', icon: 'fa-shield-alt' },
          { label: 'Terms', href: '#', icon: 'fa-file-contract' }
        ]"
      />

      <!-- FAB (mobile) -->
      <button class="fab" @click="setView('doctors')">
        <i class="fas fa-user-md"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, watch, onMounted } from 'vue'
import Sidebar from './components/SideBar.vue'
import Topbar from './components/Topbar.vue'
import FooterBar from './components/FooterBar.vue'

const VapiAssistant = defineAsyncComponent(() => import('./components/VapiAssistant.vue'))

const sidebarOpen = ref(true)
const currentView = ref('home')
const countDoctors = 17
const pageTitle = computed(() => (currentView.value === 'doctors' ? 'AI Physicians' : 'Dashboard'))
function setView(view) { currentView.value = view }

/* THEME */
const theme = ref('light') // 'light' | 'dark'

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') {
    theme.value = saved
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
})

watch(theme, (val) => {
  document.documentElement.classList.toggle('dark', val === 'dark')
  localStorage.setItem('theme', val)
})
</script>

<!-- GLOBAL (UNSCOPED) THEME VARIABLES -->
<style>
:root {
  --bg: linear-gradient(180deg, #f6f8ff 0%, #f9fbff 40%, #f6f8fb 100%);
  --panel: rgba(255,255,255,0.9);
  --panel-solid: #ffffff;
  --border: #e6eaf1;
  --text: #101827;
  --muted: #6b7280;
  --brand: #2563eb;
  --brand-2: #1a73e8;
  --accent: #ef4444;
  --shadow-1: 0 10px 25px rgba(0,0,0,.06);
  --shadow-2: 0 20px 45px rgba(0,0,0,.08);

  /* NEW: theme-aware utilities */
  --ring: var(--border);
  --ghost-bg: #f8fafc;
  --ghost-bg-hover: #eef2f7;
}

html.dark {
  --bg: linear-gradient(180deg, #1f2937 0%, #111827 100%);
  --panel: rgba(17,24,39,0.7);
  --panel-solid: #111827;      /* slightly deeper to avoid haze */
  --border: #374151;
  --text: #f9fafb;
  --muted: #9ca3af;
  --brand: #3b82f6;
  --brand-2: #2563eb;
  --accent: #f87171;

  /* Dark-mode utility tokens */
  --ring: #42526b;
  --ghost-bg: #111827;
  --ghost-bg-hover: #0f172a;

  /* Dark shadows should be deeper/softer */
  --shadow-1: 0 8px 18px rgba(0,0,0,.35);
  --shadow-2: 0 14px 40px rgba(0,0,0,.45);
}
</style>

<!-- LOCAL (SCOPED) LAYOUT STYLES -->
<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

* { box-sizing: border-box; }
html, body, #app { height: 100%; }

.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: var(--bg);
}

/* Main */
.main { display: grid; grid-template-rows: auto 1fr auto; } /* footer after content */

/* Content container */
.content { padding: 18px; max-width: 1400px; width: 100%; }

/* Home */
.hero {
  display: grid; grid-template-columns: 1.2fr .8fr; gap: 18px;
  padding: 22px; border: 1px solid var(--ring);
  background: var(--panel-solid); border-radius: 16px; box-shadow: var(--shadow-1);
}
.hero h2 { margin: 0 0 8px; font-size: 1.6rem; color: var(--text); }
.hero p { margin: 0 0 14px; color: var(--muted); }
.hero-actions { display: flex; gap: 10px; }

/* Buttons used in hero (Topbar has its own scoped button styles) */
.ghost, .primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 12px; cursor: pointer;
}
.ghost { border: 1px solid var(--ring); background: var(--ghost-bg); color: var(--text); }
.ghost:hover { background: var(--ghost-bg-hover); }
.primary { border: 0; background: linear-gradient(135deg,var(--brand),var(--brand-2)); color: #fff; box-shadow: var(--shadow-1); }
.primary:hover { filter: brightness(1.05); box-shadow: var(--shadow-2); }

.hero-illustration {
  display: grid; place-items: center; font-size: 4rem; color: var(--brand);
  background: radial-gradient(90px 90px at 70% 30%, rgba(229,237,255,.7), transparent);
  border-radius: 14px;
}
:global(html.dark) .hero-illustration {
  background: radial-gradient(90px 90px at 70% 30%, rgba(96,165,250,.28), transparent);
}

.stats {
  display: grid; grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 14px; margin-top: 16px;
}
.stat {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  border: 1px solid var(--ring); background: var(--panel-solid);
  border-radius: 14px; box-shadow: var(--shadow-1);
}
.stat i { font-size: 1.2rem; color: var(--brand); }
.stat strong { font-size: 1.2rem; color: var(--text); }
.stat span { font-size: .85rem; color: var(--muted); }

.panel {
  margin-top: 16px; padding: 16px;
  border: 1px solid var(--ring); background: var(--panel-solid);
  border-radius: 14px; box-shadow: var(--shadow-1);
}
html.dark .panel h3 {
  color: #06b6d4; /* aqua */
}
.panel h3 { margin: 0 0 8px; }
.panel ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; color: var(--muted); }
.panel li { display: flex; gap: 8px; align-items: center; }
.panel i { width: 18px; text-align: center; color: #0ea5e9; }

/* Doctors view */
.loading-card {
  display: flex; align-items: center; gap: 10px; padding: 16px;
  border: 1px solid var(--ring); border-radius: 14px;
  background: var(--panel-solid); box-shadow: var(--shadow-1);
}
.spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #e5e7eb; border-top-color: var(--brand); animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Floating action button (mobile) */
.fab {
  position: fixed; right: 18px; bottom: 18px; border: 0;
  width: 52px; height: 52px; border-radius: 50%;
  display: grid; place-items: center;
  background: linear-gradient(135deg,var(--brand),var(--brand-2));
  color: #fff; box-shadow: var(--shadow-2); display: none;
}

/* Responsive */
@media (max-width: 1100px) { .app-shell { grid-template-columns: 240px 1fr; } }
@media (max-width: 960px) { .app-shell { grid-template-columns: 76px 1fr; } }
@media (max-width: 768px) { .hero { grid-template-columns: 1fr; } }
@media (max-width: 720px) {
  .app-shell { grid-template-columns: 1fr; }
  /* Let Sidebar keep its theme surfaces (no forced gradient). */
  :deep(.sidebar) {
    position: fixed; left: 0; transform: translateX(-100%);
    transition: transform .2s ease; z-index: 50; width: 240px; background: var(--panel);
  }
  :deep(.sidebar.open) { transform: translateX(0); }
  .fab { display: grid; }
}
</style>

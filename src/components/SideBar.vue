<template>
  <aside class="sidebar" :class="{ open }">
    <div class="brand">
      <div class="brand-mark"><i class="fas fa-user-md" /></div>
      <div class="brand-text">
        <h1>AI Doctors</h1>
        <span>AI Health Suite</span>
      </div>
    </div>

    <nav class="nav">
      <p class="nav-label">General</p>

      <button
        class="nav-btn"
        :class="{ active: currentView === 'home' }"
        @click="$emit('navigate', 'home')"
      >
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
      </button>

      <button
        class="nav-btn"
        :class="{ active: currentView === 'doctors' }"
        @click="$emit('navigate', 'doctors')"
      >
        <i class="fas fa-user-nurse"></i>
        <span>All Doctors</span>
        <span class="chip">{{ countDoctors }}</span>
      </button>
      <button
        class="nav-btn"
        :class="{ active: currentView === 'chatbots' }"
        @click="$emit('navigate', 'chatbots')"
       >
        <i class="fas fa-comments"></i>
        <span>All Chatbots</span>
        <span class="chip">17</span>
      </button>
      <p class="nav-label">Shortcuts</p>
      <button class="nav-btn" @click="$emit('navigate', 'doctors')">
        <i class="fas fa-stethoscope"></i>
        <span>Start Consultation</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="foot-card">
        <i class="fas fa-bolt"></i>
        <div>
          <strong>Quick Access</strong>
          <p>Jump to AI physicians</p>
        </div>
        <button class="foot-cta" @click="$emit('navigate', 'doctors')">Open</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  currentView: { type: String, default: 'home' },
  open: { type: Boolean, default: true },
  countDoctors: { type: Number, default: 17 },
})
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Sidebar uses global theme tokens defined in App.vue:
   --panel, --panel-solid, --ring, --text, --muted, --brand, --brand-2,
   --ghost-bg, --ghost-bg-hover, --shadow-1, --shadow-2
*/

.sidebar {
  backdrop-filter: blur(6px);
  background: var(--panel);
  border-right: 1px solid var(--ring);
  padding: 24px 20px;
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  color: #fff;
  box-shadow: var(--shadow-1);
}
.brand-text h1 {
  font-size: 1.05rem;
  margin: 0;
  color: var(--text);
}
.brand-text span {
  font-size: .8rem;
  color: var(--muted);
}

.nav {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}
.nav-label {
  color: var(--muted);
  font-size: .75rem;
  letter-spacing: .04em;
  margin: 18px 8px 8px;
  text-transform: uppercase;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text);
  cursor: pointer;
}
.nav-btn .chip {
  margin-left: auto;
  /* brand-tinted chip that works in both themes */
  background: color-mix(in srgb, var(--brand) 18%, transparent);
  color: var(--brand);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: .72rem;
  font-weight: 700;
}

.nav-btn:hover {
  background: var(--ghost-bg);
  border-color: var(--ring);
}

/* Active state: subtle brand tint that still reads in dark mode */
.nav-btn.active {
  background: color-mix(in srgb, var(--brand) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand) 36%, transparent);
  color: var(--brand);
}

.sidebar-footer {
  margin-top: auto;
}

.foot-card {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--ring);
  background: var(--panel-solid);
  border-radius: 12px;
  box-shadow: var(--shadow-1);
}
html.dark .foot-card strong {
  color: #06b6d4; /* aqua shade */
}
.foot-card i {
  color: #F59E0B;
  font-size: 1.1rem;
}
.foot-card p {
  margin: 0;
  color: var(--muted);
  font-size: .85rem;
}
.foot-cta {
  background: #111827; /* default (light theme) */
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

/* DARK THEME OVERRIDE */
html.dark .foot-cta {
  background: #06b6d4; /* aqua shade */
  color: #fff;
}

.foot-cta:hover {
  filter: brightness(1.05);
}
</style>

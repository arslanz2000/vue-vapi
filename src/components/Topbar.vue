<template>
  <header class="topbar">
    <!-- Sidebar toggle -->
    <button class="icon-btn" @click="$emit('toggleSidebar')" aria-label="Toggle sidebar">
      <i class="fas" :class="sidebarOpen ? 'fa-times' : 'fa-bars'"></i>
    </button>

    <!-- Breadcrumb / page title -->
    <div class="breadcrumbs">
      <i class="fas fa-layer-group" aria-hidden="true"></i>
      <span>{{ pageTitle }}</span>
    </div>

    <div class="spacer"></div>

    <!-- Theme toggle -->
    <button
      class="ghost icon-only"
      @click="$emit('toggleTheme')"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <i :class="theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>

    <!-- Quick actions -->
    <div class="top-actions">
      <button class="ghost" @click="$emit('navigate','doctors')">
        <i class="fas fa-user-md"></i>
        All Doctors
      </button>
      <button class="primary" @click="$emit('navigate','doctors')">
        <i class="fas fa-calendar-check"></i>
        New Consultation
      </button>
    </div>

    <!-- User chip -->
    <div class="user-chip" aria-label="Account">
      <img src="https://api.dicebear.com/7.x/initials/svg?seed=AK" alt="" />
      <span>Arslan</span>
    </div>
  </header>
</template>

<script setup>
defineProps({
  pageTitle: { type: String, default: '' },
  sidebarOpen: { type: Boolean, default: true },
  theme: { type: String, default: 'light' }, // 'light' | 'dark'
})
defineEmits(['toggleSidebar', 'toggleTheme', 'navigate'])
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(6px);
}

/* Buttons */
.icon-btn {
  background: transparent;
  border: 0;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--text);
}

.ghost,
.primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
}

/* THEME-AWARE ghost button */
.ghost {
  border: 1px solid var(--ring);
  background: var(--ghost-bg);
  color: var(--text);
}
.ghost:hover { background: var(--ghost-bg-hover); }

.icon-only {
  padding: 8px 10px;
  line-height: 0;
}

/* Primary button uses brand gradient */
.primary {
  border: 0;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  color: #fff;
  box-shadow: var(--shadow-1);
}
.primary:hover { filter: brightness(1.05); box-shadow: var(--shadow-2); }

.breadcrumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-weight: 700;
}

.spacer { flex: 1; }

.top-actions { display: flex; gap: 10px; }

/* User chip */
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--ring);
  background: var(--panel-solid);
  color: var(--text);
  margin-left: 8px;
}
.user-chip img { width: 24px; height: 24px; border-radius: 50%; }
</style>

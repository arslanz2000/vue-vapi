<template>
  <header>
  </header>
  <main>
    <VapiAssistant />
  </main>
</template>

<script setup>
import VapiAssistant from './components/VapiAssistant.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

body {
  margin: 0;
  padding: 20px;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa;
  background-image: url('../assets/robotics-background-8244347.webp') !important;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

main {
  display: flex;
  justify-content: center;
}
</style>
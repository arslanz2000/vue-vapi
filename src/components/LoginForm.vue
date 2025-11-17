<template>
  <div class="auth-container">
    <form class="auth-form" @submit.prevent="handleLogin">
      <h2>Welcome Back</h2>

      <input v-model="email" type="email" placeholder="Email Address" required />
      <input v-model="password" type="password" placeholder="Password" required />

      <button type="submit" class="btn-primary">Login</button>

      <p class="switch">
        Don’t have an account?
        <a href="#" @click.prevent="emit('navigate', 'signup')">Sign Up</a>
      </p>
      <button type="button" class="btn-google" @click="loginWithGoogle">
        Continue with Google
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login } from "../services/auth";

const emit = defineEmits(["navigate"]);

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    // Call API
    const response = await login(email.value, password.value);

    console.log("Logged in:", response);

    // ✅ Save token + user in localStorage
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify({
      name: response.name || "User",
      email: response.email || email.value,
    }));

    // Save view state
    localStorage.setItem("currentView", "home");

    // ✅ Redirect to dashboard
    emit("navigate", "home");
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Login failed. Please check your credentials.");
  }
};
const loginWithGoogle = () => {
  window.location.href = "https://dashboard.evomations.com/auth/google";
};

</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: var(--bg);
  position: fixed;
  top: 0;
  left: 0;
}

.auth-form {
  width: 100%;
  max-width: 380px;
  background: var(--panel-solid, #fff);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-2, 0 10px 40px rgba(0,0,0,0.1));
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.6rem;
  color: var(--text);
}

.auth-form input {
  padding: 12px;
  border: 1px solid var(--border, #ddd);
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
}

.auth-form input:focus {
  border-color: var(--brand, #2563eb);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand, #2563eb), var(--brand-2, #1a73e8));
  color: #fff;
  padding: 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.switch {
  text-align: center;
  font-size: 0.9rem;
  color: var(--muted, #64748b);
}

.switch a {
  color: var(--brand, #2563eb);
  font-weight: 600;
  text-decoration: none;
}
.switch a:hover {
  text-decoration: underline;
}
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #dadce0;
  background: #fff;
  color: #444;
  font-weight: 500;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 10px;
}

.btn-google:hover {
  background: #f7f8f8;
  transform: translateY(-1px);
}

.btn-google img {
  width: 20px;
  height: 20px;
}

</style>

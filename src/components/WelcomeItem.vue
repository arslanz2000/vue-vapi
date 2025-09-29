<template>
  <div class="container ai-dark">
    <!-- Professional Header -->
    <header class="header">
      <div class="header__content">
        <div class="logo">
          <i class="fas fa-heartbeat logo-icon"></i>
          <div>
            <h1 class="header__title">MediConnect AI</h1>
            <p class="header__subtitle">24/7 access to specialized AI physicians for immediate healthcare consultation</p>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-user-md"></i>
            </div>
            <span>20+ Specialized Doctors</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <span>Instant 24/7 Access</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-stethoscope"></i>
            </div>
            <span>98% Patient Satisfaction</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Search and Filter Controls -->
    <div class="controls">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" v-model="searchQuery" placeholder="Search doctors by name or specialty...">
      </div>
      
      <select class="filter-select" v-model="specialtyFilter">
        <option value="">All Specialties</option>
        <option v-for="specialty in uniqueSpecialties" :value="specialty">{{ specialty }}</option>
      </select>
      
      <div class="filter-select">
        <i class="fas fa-sliders-h"></i>
        Sort by: 
        <select v-model="sortBy" style="border: none; background: transparent; font: inherit;">
          <option value="name">Name</option>
          <option value="specialty">Specialty</option>
        </select>
      </div>
    </div>

    <!-- Doctors Grid Section -->
    <h2 class="section-title">
      <i class="fas fa-user-md"></i>
      Available AI Physicians
    </h2>
    
    <section class="doctor-grid">
      <div v-for="(doctor, index) in filteredDoctors" 
           :key="doctor.id" 
           class="doctor-card fade-in"
           :style="{ 'animation-delay': `${index * 0.05}s` }">
        <div class="doctor-header">
          <div class="doctor-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="doctor-info">
            <p class="doctor-name">{{ doctor.name }}</p>
            <p class="doctor-specialty">{{ doctor.specialty }}</p>
            <div class="doctor-rating">
              <div class="rating-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
              </div>
              <span>4.8</span>
            </div>
          </div>
        </div>
        
        <div class="doctor-details">
          <div class="detail-item">
            <div class="detail-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div>Board Certified in {{ doctor.specialty }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">
              <i class="fas fa-language"></i>
            </div>
            <div>English, Spanish, French</div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">
              <i class="fas fa-briefcase-medical"></i>
            </div>
            <div>15+ years experience</div>
          </div>
          
          <div class="availability">
            <div class="availability-dot"></div>
            <div>Available now for consultation</div>
          </div>
        </div>
        
        <div class="doctor-actions">
          <button class="btn btn--call"
                  @click="startCall(doctor)"
                  :disabled="callActive && activeDoctorId === doctor.id">
            <i class="fas fa-phone-alt"></i>
            {{ (callActive && activeDoctorId === doctor.id) ? 'In Call...' : 'Start Call' }}
          </button>
          <button class="btn btn--profile">
            <i class="fas fa-user"></i>
            Profile
          </button>
        </div>
      </div>
    </section>

    <!-- Active Call Banner -->
    <aside v-if="callActive" class="active-call" role="status" aria-live="polite">
      <p class="active-call__text">
        <i class="fas fa-phone-alt"></i>
        In call with <strong>{{ currentDoctorName }}</strong>
      </p>
      <div class="call-info">
        <div class="call-timer">
          <i class="fas fa-clock"></i>
          {{ callTimer }}
        </div>
        <button class="btn btn--end" @click="stopCall">
          <i class="fas fa-phone-slash"></i>
          End Call
        </button>
      </div>
    </aside>

    <!-- Status Message -->
    <p v-if="status && !callActive" class="status">
      <span v-if="statusLoading" class="loading">
        <span>{{ status }}</span>
        <span class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </span>
      <span v-else>{{ status }}</span>
    </p>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-section">
        <h3 class="footer-title">MediConnect AI</h3>
        <p>Revolutionizing healthcare with AI-powered consultations, available 24/7 for your medical needs.</p>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">Quick Links</h3>
        <ul class="footer-links">
          <li><a href="#"><i class="fas fa-chevron-right"></i> About Us</a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> Services</a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> How It Works</a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> Pricing</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">Specialties</h3>
        <ul class="footer-links">
          <li><a href="#"><i class="fas fa-chevron-right"></i> Cardiology</a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> Dermatology</a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> Neurology</a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> Pediatrics</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-title">Contact Us</h3>
        <ul class="footer-links">
          <li><i class="fas fa-envelope"></i> support@mediconnect.ai</li>
          <li><i class="fas fa-phone"></i> +1 (800) MED-AI24</li>
          <li><i class="fas fa-map-marker-alt"></i> San Francisco, CA</li>
        </ul>
      </div>
    </footer>
    
    <div class="copyright">
      &copy; 2023 MediConnect AI. All rights reserved. HIPAA compliant and secure healthcare platform.
    </div>
  </div>
  <!-- Call Popup Modal -->
<div v-if="showCallPopup" class="call-popup-overlay">
  <div class="call-popup">
    <h3>Calling {{ currentDoctorName }}</h3>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: callProgress + '%' }"></div>
    </div>
    <p>{{ callProgress }}% connecting...</p>
  </div>
</div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Vapi from '@vapi-ai/web';

const PUBLIC_KEY = 'c9773d29-c83b-4903-959a-d40a77793396';
let vapi;

// Doctors data
const doctors = ref([
  { id: 'dr-david',    name: 'Dr. David Chen',    specialty: 'Cardiology',        assistantId: 'ba2f0969-4750-4190-a91f-2c5dc814bced' },
  { id: 'dr-miles',    name: 'Dr. Miles Johnson',    specialty: 'Oncology',          assistantId: 'e225eced-43ba-474c-989e-4497e8f8588c' },
  { id: 'dr-morgan',   name: 'Dr. Morgan Lee',   specialty: 'Hematology',        assistantId: '6ee484ac-18fb-401c-ba14-67a1a8ffc5d5' },
  { id: 'dr-taylor',   name: 'Dr. Taylor Wilson',   specialty: 'Gynecology',        assistantId: '6b04a133-3158-4c3c-b5af-9f83b38efd56' },
  { id: 'dr-omaar',    name: 'Dr. Omaar Ahmed',    specialty: 'Ophthalmology',     assistantId: 'e60bcf74-a1ab-4453-9ebc-77e01a90558a' },
  { id: 'dr-grace',    name: 'Dr. Grace Kim',    specialty: 'Dermatology',       assistantId: 'c0c28d30-8e0d-4787-8072-e2cd6a1df032' },
  { id: 'dr-andrew',   name: 'Dr. Andrew Park',   specialty: 'Infectology',       assistantId: 'c25e654b-4ad5-4e72-b6b0-49354fb8c957' },
  { id: 'dr-scarlett', name: 'Dr. Scarlett Davis', specialty: 'Orthopedics',         assistantId: '10b4d79f-9e8a-4b18-b528-a8ff2ca4fb94' },
  { id: 'dr-nova',     name: 'Dr. Nova Rodriguez',     specialty: 'Psychiatry',        assistantId: 'e4608542-a6c0-4517-8df0-72c539ea5014' },
  { id: 'dr-robert',   name: 'Dr. Robert Brown',   specialty: 'Gastroenterology',  assistantId: '38523be1-eaa4-4f11-a418-4c7cccf20212' },
  { id: 'dr-daniel',   name: 'Dr. Daniel Garcia',   specialty: 'Pulmonology',       assistantId: '2489de55-7d05-4282-ab89-acd44a1198c7' },
  { id: 'dr-williams', name: 'Dr. Williams Smith', specialty: 'Dentistry',             assistantId: 'd43273a6-82e4-4462-ba07-72346e23e6f9' },
  { id: 'dr-susan',    name: 'Dr. Susan Miller',    specialty: 'Endocrinology',     assistantId: '3ce663b3-2ac9-463e-a943-bac7b7b8ea0f' },
  { id: 'dr-emma',     name: 'Dr. Emma Thompson',     specialty: 'Urology',           assistantId: '6a266708-6b19-4b92-92ad-832a2e960abd' },
  { id: 'dr-ellie',    name: 'Dr. Ellie Clark',    specialty: 'ENT Specialist',      assistantId: '16cd535c-8137-40c8-aa94-40e19c103648' },
  { id: 'dr-michael',  name: 'Dr. Michael Wright',  specialty: 'Neurology',         assistantId: '1c964479-ebe7-4fe7-b446-acb23173664e' },
  { id: 'dr-sophie',   name: 'Dr. Sophie Martinez',   specialty: 'General Practice',      assistantId: '13e6ca08-cec8-4bff-816e-e5fbad4a633c' },
]);

// State management
const callActive = ref(false);
const activeDoctorId = ref(null);
const status = ref('');
const statusLoading = ref(false);
const callTimer = ref('00:00');
const searchQuery = ref('');
const specialtyFilter = ref('');
const sortBy = ref('name');
const showCallPopup = ref(false);
const callProgress = ref(0);

// Computed properties
const currentDoctorName = computed(() => {
  const doctor = doctors.value.find(d => d.id === activeDoctorId.value);
  return doctor ? `${doctor.name} (${doctor.specialty})` : '';
});

const uniqueSpecialties = computed(() => {
  return [...new Set(doctors.value.map(d => d.specialty))].sort();
});

const filteredDoctors = computed(() => {
  let result = [...doctors.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(doctor => 
      doctor.name.toLowerCase().includes(query) || 
      doctor.specialty.toLowerCase().includes(query)
    );
  }
  
  // Apply specialty filter
  if (specialtyFilter.value) {
    result = result.filter(doctor => 
      doctor.specialty === specialtyFilter.value
    );
  }
  
  // Apply sorting
  if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'specialty') {
    result.sort((a, b) => a.specialty.localeCompare(b.specialty));
  }
  
  return result;
});

// Methods
const startCall = async (doctor) => {
  activeDoctorId.value = doctor.id;
  status.value = `Connecting to ${doctor.name}...`;
  statusLoading.value = true;
  showCallPopup.value = true;
  callProgress.value = 0;

  const interval = setInterval(() => {
    if (callProgress.value < 100) {
      callProgress.value += 10;
    } else {
      clearInterval(interval);
    }
  }, 100);

  try {
    await vapi.start(doctor.assistantId);
    callActive.value = true;
    statusLoading.value = false;
    showCallPopup.value = false;
    startCallTimer();
  } catch (err) {
    handleVapiError(err);
    statusLoading.value = false;
    showCallPopup.value = false;
  }
};
const stopCall = () => {
  vapi.stop();
  callActive.value = false;
  status.value = `Call ended with ${currentDoctorName.value}`;
  activeDoctorId.value = null;
  clearInterval(timerInterval);
  
  // Clear status after 5 seconds
  setTimeout(() => {
    status.value = '';
  }, 5000);
};

const handleVapiError = (err) => {
  const msg = typeof err === 'string'
    ? err
    : err.message || String(err);
  console.error('VAPI error:', msg);
  status.value = `Error: ${msg}`;
};

// Call timer functionality
let timerInterval = null;
let seconds = 0;

const startCallTimer = () => {
  seconds = 0;
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    callTimer.value = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
};

// VAPI event handlers
onMounted(() => {
  vapi = new Vapi(PUBLIC_KEY);
  
  vapi.on('call-start', () => {
    status.value = `Connected to ${currentDoctorName.value}`;
    setTimeout(() => {
      status.value = '';
    }, 3000);
  });
  
  vapi.on('call-end', () => {
    stopCall();
  });
  
  vapi.on('error', e => {
    handleVapiError(e.error?.message || String(e.error));
  });
  
  status.value = 'Platform initialized. Select a doctor to start a call.';
  
  setTimeout(() => {
    status.value = '';
  }, 5000);
});
</script>

<style scoped>
:root {
  --primary: #00bcd4;
  --accent: #ff4081;
  --dark-bg: #0f0f1a;
  --card-bg: #1b1c2e;
  --text-light: #e0e0e0;
  --text-muted: #a0a0a0;
  --secondary: #26c6da;
  --highlight: #00e5ff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
  color: var(--dark);
  line-height: 1.6;
  min-height: 100vh;
  padding: 20px;
  
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  background: white !important;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
  
}

/* Header Styles */
.header {
  background: linear-gradient(120deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 25px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
}

.header__content {
  position: relative;
  z-index: 2;
}

.header__title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.9;
  max-width: 600px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 2.5rem;
  color: white;
}

.stats {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.stat-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Search and Filter */
.controls {
  padding: 20px 40px;
  background: var(--light);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.search-box {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border-radius: 50px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
}

.filter-select {
  padding: 12px 20px;
  border-radius: 50px;
  border: 1px solid #ddd;
  background: white;
  font-size: 1rem;
  cursor: pointer;
}

/* Doctors Grid */
.section-title {
  padding: 20px 40px 10px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark);
  display: flex;
  align-items: center;
  gap: 10px;
}

.doctor-grid {
  display: grid;
  gap: 25px;
  padding: 10px 40px 30px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .doctor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .doctor-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1400px) {
  .doctor-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.doctor-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.doctor-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.doctor-header {
  background: linear-gradient(120deg, #4a6fa5, #1a73e8);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.doctor-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.doctor-info {
  flex: 1;
}

.doctor-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.doctor-specialty {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.doctor-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.rating-stars {
  color: #FFC107;
}

.doctor-details {
  padding: 20px;
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.detail-icon {
  color: var(--primary);
  width: 24px;
  text-align: center;
}

.availability {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
  font-size: 0.9rem;
}

.availability-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--secondary);
}

.doctor-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  padding: 12px 20px;
  flex: 1;
  text-align: center;
}

.btn--call {
  background: var(--secondary);
  color: #121212;
}

.btn--call:hover:not(:disabled) {
  background: #00b247;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
}

.btn--profile {
  background: var(--light-gray);
  color: var(--dark);
}

.btn--profile:hover {
  background: #e8eaed;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Active Call Banner */
.active-call {
  background: linear-gradient(120deg, #4a6fa5, #1a73e8);
  color: white;
  padding: 20px 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  animation: slideIn 0.5s ease-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.active-call__text {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-call__text strong {
  font-weight: 600;
}

.call-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.call-timer {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 15px;
  border-radius: 50px;
  font-size: 0.95rem;
}

.btn--end {
  background: #e53935;
  color: white;
  padding: 12px 28px;
  font-weight: 500;
  min-width: 140px;
}

.btn--end:hover {
  background: #c62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
}

/* Status Message */
.status {
  padding: 15px 40px;
  text-align: center;
  font-size: 1rem;
  color: var(--gray);
  background: var(--light);
}

.loading {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.loading-dots {
  display: inline-flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  display: inline-block;
  animation: bounce 1.5s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

/* Footer */
.footer {
  background: var(--light);
  padding: 25px 40px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 30px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--dark);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: var(--gray);
  text-decoration: none;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--primary);
}

.copyright {
  text-align: center;
  padding: 20px;
  color: var(--gray);
  font-size: 0.9rem;
  border-top: 1px solid #e0e0e0;
  background: white;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.fade-in {
  animation: fadeInUp 0.6s ease forwards;
}

.ai-dark {
  background: var(--dark-bg);
  color: var(--text-light);
}

.ai-dark .doctor-card,
.ai-dark .footer,
.ai-dark .controls,
.ai-dark .status {
  background: var(--card-bg);
  color: var(--text-light);
}

/* Call Popup Modal */
.call-popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.call-popup {
  background: #121212;
  color: #fff;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  width: 300px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.progress-bar {
  background: #2c2c2c;
  height: 10px;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  margin: 15px 0;
}

.progress-fill {
  background: var(--highlight);
  height: 100%;
  width: 0;
  transition: width 0.3s ease;
}

.ai-dark .header {
  background: linear-gradient(120deg, #4a6fa5, #1a73e8) !important;
  color: var(--text-light);
}

.ai-dark .header__subtitle {
  color: var(--text-muted);
}

.ai-dark .stat-icon {
  background: rgba(255, 255, 255, 0.1);
}

.ai-dark .header {
  background: linear-gradient(135deg, #1b2d55, #304d89);
  border-radius: 20px 20px 0 0;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

</style>


// old code 
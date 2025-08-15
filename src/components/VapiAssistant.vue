<template>
  <div class="container">
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
          <a
            class="btn btn--book"
            :href="`https://calendly.com/arslan-khan-icustoms/30min`"
            target="_blank">
            <i class="fas fa-calendar-alt"></i>
            consultation
          </a>
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

    <!-- Modern Call Popup -->
    <div v-if="callState !== 'idle'" class="call-popup-overlay">
      <div class="call-popup">
        <div class="call-header">
          <div class="call-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="call-info">
            <h3>{{ currentDoctorName }}</h3>
            <p v-if="callState === 'calling'">Calling...</p>
            <p v-else>{{ callTimer }}</p>
          </div>
        </div>

        <!-- Progress bar for connecting state -->
        <div v-if="callState === 'calling'" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: callProgress + '%' }"></div>
          </div>
          <p>{{ callProgress }}% connecting...</p>
        </div>

        <!-- Active call controls -->
        <div v-if="callState === 'active'" class="call-controls">
          <button class="control-btn" @click="toggleMute">
            <i class="fas" :class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
            <span>{{ isMuted ? 'Unmute' : 'Mute' }}</span>
          </button>
          <button class="control-btn" @click="toggleSpeaker">
            <i class="fas" :class="isSpeakerOn ? 'fa-volume-up' : 'fa-volume-mute'"></i>
            <span>{{ isSpeakerOn ? 'Speaker On' : 'Speaker Off' }}</span>
          </button>
          <button class="control-btn" @click="toggleHold">
            <i class="fas" :class="isOnHold ? 'fa-play' : 'fa-pause'"></i>
            <span>{{ isOnHold ? 'Resume' : 'Hold' }}</span>
          </button>
        </div>

        <div class="call-actions">
          <button v-if="callState === 'calling'" 
                  class="cancel-btn"
                  @click="cancelCall">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          
          <button v-if="callState === 'active'" 
                  class="end-call-btn"
                  @click="stopCall">
            <i class="fas fa-phone-slash"></i>
          </button>
        </div>
      </div>
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
const callProgress = ref(0);

// New call state variables
const callState = ref('idle'); // 'idle', 'calling', 'active'
const isMuted = ref(false);
const isSpeakerOn = ref(false);
const isOnHold = ref(false);

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
  callState.value = 'calling';
  callProgress.value = 0;
  status.value = `Connecting to ${doctor.name}...`;
  statusLoading.value = true;

  const interval = setInterval(() => {
    if (callProgress.value < 100) {
      callProgress.value += 10;
    } else {
      clearInterval(interval);
    }
  }, 300);

  try {
    await vapi.start(doctor.assistantId);
    callState.value = 'active';
    callActive.value = true;
    statusLoading.value = false;
    startCallTimer();
  } catch (err) {
    handleVapiError(err);
    callState.value = 'idle';
    callActive.value = false;
    statusLoading.value = false;
  }
};

const stopCall = () => {
  vapi.stop();
  callState.value = 'idle';
  callActive.value = false;
  clearInterval(timerInterval);
  status.value = `Call ended with ${currentDoctorName.value}`;
  
  // Clear status after 5 seconds
  setTimeout(() => {
    status.value = '';
  }, 5000);
};

const cancelCall = () => {
  vapi.stop();
  callState.value = 'idle';
  callActive.value = false;
  status.value = 'Call canceled';
  setTimeout(() => status.value = '', 3000);
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (isMuted.value) {
    vapi.mute();
  } else {
    vapi.unmute();
  }
};

const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value;
  // Implement speaker toggle logic as needed
};

const toggleHold = () => {
  isOnHold.value = !isOnHold.value;
  // Implement hold functionality as needed
};

const handleVapiError = (err) => {
  const msg = typeof err === 'string' ? err : err.message || String(err);
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
    callState.value = 'active';
    startCallTimer();
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
/* Modern Call Popup Styles */
.call-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.call-popup {
  width: 90%;
  max-width: 400px;
  background: linear-gradient(135deg, #1e2a4a 0%, #0f1729 100%);
  border-radius: 25px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.call-header {
  margin-bottom: 30px;
}

.call-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a6fa5, #1a73e8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.call-info h3 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  font-weight: 600;
  color: white;
}

.call-info p {
  font-size: 1.2rem;
  color: #a0b3e6;
}

.progress-container {
  margin: 30px 0;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #00bcd4, #00e5ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.call-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 15px;
  padding: 15px;
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn i {
  font-size: 1.8rem;
  margin-bottom: 8px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.control-btn:active {
  transform: translateY(1px);
}

.call-actions {
  display: flex;
  justify-content: center;
}

.cancel-btn {
  background: rgba(255, 77, 79, 0.2);
  border: 1px solid rgba(255, 77, 79, 0.5);
  border-radius: 30px;
  padding: 12px 30px;
  color: #ff4d4f;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 77, 79, 0.3);
}

.cancel-btn i {
  margin-right: 8px;
}

.end-call-btn {
  background: #ff4d4f;
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(255, 77, 79, 0.4);
  transition: all 0.3s ease;
}

.end-call-btn:hover {
  background: #ff2a2d;
  transform: scale(1.05);
}

.end-call-btn:active {
  transform: scale(0.95);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Existing styles */
:root {
  --primary: #00bcd4;
  --accent: #ff4081;
  --dark-bg: #0f0f1a;
  --card-bg: #1b1c2e;
  --text-light: #e0e0e0;
  --text-muted: #a0a0a0;
  --secondary: #26c6da;
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

.controls {
  padding: 20px 40px;
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
  display: flex;
  flex-direction: column;
  height: 100%;
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
}

.doctor-info {
  flex: 1;
}

.doctor-name {
  font-size: 1.3rem;
  font-weight: 600;
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

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  flex: 1;
}

.btn--call {
  background: var(--secondary);
  color: #121212;
}

.btn--profile {
  background: var(--light-gray);
  color: var(--dark);
}

.btn--book {
  background: var(--accent);
  text-decoration: none;
  text-align: center;
}

.active-call {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #1b1c2e;
  color: white;
  padding: 15px 25px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.active-call__text {
  margin: 0;
  font-size: 1rem;
}

.call-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.call-timer {
  font-size: 0.9rem;
}

.btn--end {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
}

.status {
  text-align: center;
  padding: 15px;
  font-size: 1rem;
}

.loading {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.loading-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  margin: 0 2px;
  animation: pulse 1.5s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.5s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.75);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
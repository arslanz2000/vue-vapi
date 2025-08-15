<template>
  <div class="container ai-dark">
    <!-- Professional Header -->
    <header class="header">
      <div class="header__content">
        <h1 class="logo">
          <i class="fas fa-brain"></i> AI Doctor Connect
        </h1>
        <p class="subtitle">Advanced AI-powered healthcare platform connecting patients with top medical professionals</p>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-user-md"></i>
            </div>
            <span>{{ doctors.length }}+ Specialized Doctors</span>
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
    <section class="search-section">
      <div class="search-bar">
        <input 
          type="text" 
          class="search-input" 
          v-model="searchQuery" 
          placeholder="Search doctors by name or specialty..."
        >
        <button class="search-btn">
          <i class="fas fa-search"></i> Search
        </button>
      </div>
      
      <div class="filters">
        <button 
          class="filter-btn"
          :class="{ active: specialtyFilter === '' }"
          @click="specialtyFilter = ''"
        >
          All Specialties
        </button>
        <button 
          v-for="specialty in uniqueSpecialties" 
          :key="specialty"
          class="filter-btn"
          :class="{ active: specialtyFilter === specialty }"
          @click="specialtyFilter = specialty"
        >
          {{ specialty }}
        </button>
      </div>
    </section>

    <!-- Doctors Grid Section -->
    <div class="results-info">
      <div class="results-count">
        Showing {{ filteredDoctors.length }} of {{ doctors.length }} doctors
      </div>
      <div class="sort-options">
        <select v-model="sortBy">
          <option value="name">Sort by Name</option>
          <option value="specialty">Sort by Specialty</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>
    </div>
    
    <section class="doctors-grid">
      <div 
        v-for="(doctor, index) in filteredDoctors" 
        :key="doctor.id" 
        class="doctor-card fade-in"
        :style="{ 'animation-delay': `${index * 0.05}s` }"
      >
        <div class="card-header">
          <div class="doctor-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <span class="availability-badge">Available Now</span>
          <button 
            class="favorite-btn"
            @click="toggleFavorite(doctor.id)"
          >
            <i class="fas fa-heart"></i>
          </button>
        </div>
        
        <div class="card-content">
          <h3 class="doctor-name">{{ doctor.name }}</h3>
          <p class="doctor-specialty">{{ doctor.specialty }}</p>
          
          <div class="rating">
            <div class="stars">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star-half-alt"></i>
            </div>
            <span class="rating-value">4.8</span>
            <span class="reviews">(256 reviews)</span>
          </div>
          
          <div class="doctor-info">
            <div class="info-item">
              <div class="info-icon">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="info-text">15+ years experience</div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="info-text">San Francisco, CA</div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <i class="fas fa-hospital"></i>
              </div>
              <div class="info-text">AI Medical Center</div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <div class="info-text">Board Certified</div>
            </div>
          </div>
          
          <div class="languages">
            <span class="language-tag">English</span>
            <span class="language-tag">Spanish</span>
            <span class="language-tag">French</span>
          </div>
          
          <div class="price">$250/session</div>
          
          <div class="action-buttons">
            <button 
              class="book-btn"
              @click="startCall(doctor)"
              :disabled="callActive && activeDoctorId === doctor.id"
            >
              <i class="fas fa-phone-alt"></i>
              {{ (callActive && activeDoctorId === doctor.id) ? 'In Call...' : 'Start Call' }}
            </button>
            <button class="action-btn">
              <i class="fas fa-video"></i>
            </button>
            <button class="action-btn">
              <i class="fas fa-calendar-alt"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredDoctors.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <h3>No doctors found</h3>
        <p>Try adjusting your search criteria</p>
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
        <h3 class="footer-title">AI Doctor Connect</h3>
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
          <li><i class="fas fa-envelope"></i> support@aidrconnect.ai</li>
          <li><i class="fas fa-phone"></i> +1 (800) AI-DOC24</li>
          <li><i class="fas fa-map-marker-alt"></i> San Francisco, CA</li>
        </ul>
      </div>
    </footer>
    
    <div class="copyright">
      &copy; 2023 AI Doctor Connect. All rights reserved. HIPAA compliant and secure healthcare platform.
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
const favorites = ref([]);

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
  } else if (sortBy.value === 'rating') {
    // For demo purposes, we'll use a fixed rating
    result.sort((a, b) => b.id.localeCompare(a.id)); // Just to shuffle
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

const toggleFavorite = (doctorId) => {
  const index = favorites.value.indexOf(doctorId);
  if (index > -1) {
    favorites.value.splice(index, 1);
  } else {
    favorites.value.push(doctorId);
  }
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
/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: #e0e0e0;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Styles */
.header {
  text-align: center;
  padding: 30px 0;
  margin-bottom: 30px;
}

.logo {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #00c9ff, #92fe9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 201, 255, 0.3);
}

.subtitle {
  color: #a0a0c0;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 20px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #c0c0e0;
}

.stat-icon {
  background: rgba(0, 201, 255, 0.1);
  width: 35px;
  height: 35px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00c9ff;
}

/* Search Section */
.search-section {
  background: rgba(30, 30, 60, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 100, 200, 0.2);
}

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border-radius: 12px;
  border: 2px solid rgba(100, 100, 200, 0.3);
  background: rgba(20, 20, 40, 0.7);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00c9ff;
  box-shadow: 0 0 20px rgba(0, 201, 255, 0.2);
}

.search-btn {
  padding: 15px 30px;
  background: linear-gradient(45deg, #00c9ff, #92fe9d);
  border: none;
  border-radius: 12px;
  color: #0f0c29;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 201, 255, 0.4);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.filter-btn {
  padding: 10px 20px;
  background: rgba(50, 50, 90, 0.6);
  border: 1px solid rgba(100, 100, 200, 0.3);
  border-radius: 25px;
  color: #c0c0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover, .filter-btn.active {
  background: linear-gradient(45deg, #00c9ff, #92fe9d);
  color: #0f0c29;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 201, 255, 0.3);
}

/* Results Info */
.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 10px;
}

.results-count {
  color: #a0a0c0;
  font-size: 1.1rem;
}

.sort-options select {
  background: rgba(30, 30, 60, 0.7);
  border: 1px solid rgba(100, 100, 200, 0.3);
  border-radius: 8px;
  color: white;
  padding: 10px 15px;
}

/* Doctors Grid */
.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.doctor-card {
  background: rgba(30, 30, 60, 0.7);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
  border: 1px solid rgba(100, 100, 200, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.doctor-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 201, 255, 0.2);
  border-color: rgba(0, 201, 255, 0.4);
}

.card-header {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(120deg, #4a6fa5, #1a73e8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.doctor-avatar {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.8);
}

.availability-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 201, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #00c9ff;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(0, 201, 255, 0.3);
}

.favorite-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #ff6b6b;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ff4757;
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
}

.card-content {
  padding: 25px;
}

.doctor-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: white;
}

.doctor-specialty {
  color: #00c9ff;
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.stars {
  color: #ffd700;
}

.rating-value {
  font-weight: 600;
  color: white;
}

.reviews {
  color: #a0a0c0;
  font-size: 0.9rem;
}

.doctor-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon {
  width: 35px;
  height: 35px;
  background: rgba(0, 201, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00c9ff;
}

.info-text {
  font-size: 0.9rem;
  color: #c0c0e0;
}

.languages {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
}

.language-tag {
  background: rgba(0, 201, 255, 0.1);
  color: #00c9ff;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #92fe9d;
  margin-bottom: 20px;
  text-align: center;
}

.action-buttons {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
}

.book-btn {
  background: linear-gradient(45deg, #00c9ff, #92fe9d);
  border: none;
  border-radius: 12px;
  color: #0f0c29;
  font-weight: 600;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 201, 255, 0.4);
}

.book-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn {
  background: rgba(50, 50, 90, 0.6);
  border: 1px solid rgba(100, 100, 200, 0.3);
  border-radius: 12px;
  color: #c0c0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(100, 100, 200, 0.3);
  transform: translateY(-2px);
}

/* No Results */
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #a0a0c0;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #00c9ff;
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
  border-radius: 12px;
  margin-bottom: 30px;
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
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
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
  color: #a0a0c0;
  background: rgba(30, 30, 60, 0.7);
  border-radius: 12px;
  margin-bottom: 30px;
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
  background: #00c9ff;
  display: inline-block;
  animation: bounce 1.5s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

/* Footer */
.footer {
  background: rgba(30, 30, 60, 0.7);
  padding: 25px 40px;
  border-top: 1px solid rgba(100, 100, 200, 0.2);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 30px;
  border-radius: 0 0 20px 20px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: white;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
  color: #a0a0c0;
}

.footer-links a {
  color: #a0a0c0;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: #00c9ff;
}

.footer-links i {
  margin-right: 8px;
  color: #00c9ff;
  font-size: 0.8rem;
}

.copyright {
  text-align: center;
  padding: 20px;
  color: #a0a0c0;
  font-size: 0.9rem;
  border-top: 1px solid rgba(100, 100, 200, 0.2);
  background: rgba(20, 20, 40, 0.7);
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
  background: #00c9ff;
  height: 100%;
  width: 0;
  transition: width 0.3s ease;
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

/* Responsive */
@media (max-width: 768px) {
  .doctors-grid {
    grid-template-columns: 1fr;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
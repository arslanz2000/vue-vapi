<template>
  <div class="container">
    <div class="controls">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" v-model="searchQuery" placeholder="Search doctors by name or specialty..." />
      </div>
      <select class="filter-select" v-model="specialtyFilter">
        <option value="">All Specialties</option>
        <option v-for="specialty in uniqueSpecialties" :key="specialty" :value="specialty">
          {{ specialty }}
        </option>
      </select>
      <div class="filter-select" style="display:flex;align-items:center;gap:8px">
        <i class="fas fa-sliders-h"></i>
        Sort by:
        <select v-model="sortBy" style="border:none;background:transparent;font:inherit;outline:none">
          <option value="name">Name</option>
          <option value="specialty">Specialty</option>
        </select>
      </div>
      <div v-if="callActive" class="filter-select" style="display:flex;align-items:center;gap:10px">
        <i class="fas fa-file-upload"></i>
        <label class="btn" style="cursor:pointer;padding:10px 12px">
          <input type="file" accept="application/pdf" @change="handlePdfToCall" style="display:none" />
          Send PDF to Doctor
        </label>
        <small v-if="uploadingDoc">{{ uploadStatus }}</small>
      </div>
    </div>

    <section v-if="callActive" class="call-surface">
      <div class="call-center">
        <div class="vid-avatar">
          <i class="fas fa-user-md"></i>
        </div>
        <h2 class="call-title">{{ currentDoctorName }}</h2>
        <div class="call-timer-big">
          <i class="fas fa-clock"></i>
          {{ callTimer }}
        </div>
        <div class="call-cta-row">
          <button class="round-cta" @click="toggleMute" :aria-pressed="isMuted">
            <i class="fas" :class="isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
            <span>{{ isMuted ? 'Unmute' : 'Mute' }}</span>
          </button>
          <button class="round-cta" @click="toggleSpeaker" :aria-pressed="isSpeakerOn">
            <i class="fas" :class="isSpeakerOn ? 'fa-volume-up' : 'fa-volume-mute'"></i>
            <span>{{ isSpeakerOn ? 'Speaker On' : 'Speaker Off' }}</span>
          </button>
          <button class="round-cta" @click="toggleHold" :aria-pressed="isOnHold">
            <i class="fas" :class="isOnHold ? 'fa-play' : 'fa-pause'"></i>
            <span>{{ isOnHold ? 'Resume' : 'Hold' }}</span>
          </button>
          <button class="round-cta end" @click="stopCall" aria-label="End Call">
            <i class="fas fa-phone-slash"></i>
            <span>End</span>
          </button>
          <button class="round-cta consult" @click="openConsultation" aria-label="Book Consultation">
            <i class="fas fa-calendar-alt"></i>
            <span>Consultation</span>
          </button>
        </div>
      </div>

      <div class="chat-wrap">
        <div class="bubble-list" ref="captionsEl" aria-live="polite" aria-atomic="false">
          <div v-for="(c, i) in captions" :key="c.ts + '-' + i" class="bubble" :data-role="c.role">
            <div class="bubble-meta">{{ c.role === 'assistant' ? 'Doctor' : 'You' }}</div>
            <div class="bubble-text">
              {{ c.text }}
              <span v-if="!c.final" class="cap-interim">…</span>
            </div>
          </div>
          <div class="upload-row">
            <label class="attach-btn">
              <i class="fas fa-file-upload"></i>
              <span>Send PDF to Doctor</span>
              <input type="file" accept="application/pdf" @change="handlePdfToCall" />
            </label>
            <small v-if="uploadingDoc" class="upload-status">{{ uploadStatus }}</small>
          </div>
        </div>
      </div>
    </section>

    <template v-else>
      <h2 class="section-title">
        <i class="fas fa-user-md"></i>
        Available AI Physicians
      </h2>
      <section class="doctor-grid">
        <div v-for="(doctor, index) in filteredDoctors" :key="doctor.id" class="doctor-card fade-in" :style="{ 'animation-delay': `${index * 0.05}s` }">
          <div class="doctor-header">
            <div class="doctor-avatar">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="doctor-info">
              <p class="doctor-name">{{ doctor.name }}</p>
              <p class="doctor-specialty">{{ doctor.specialty }}</p>
            </div>
          </div>
          <div class="doctor-details">
            <div class="detail-item">
              <div class="detail-icon">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <div>Board Certified in {{ doctor.specialty }}</div>
            </div>
            <div class="availability">
              <div class="availability-dot"></div>
              <div>Available now for consultation</div>
            </div>
          </div>
          <div class="doctor-actions">
            <button class="btn btn--call" @click="startCall(doctor)" :disabled="callActive && activeDoctorId === doctor.id">
              <i class="fas fa-phone-alt"></i>
              {{ (callActive && activeDoctorId === doctor.id) ? 'In Call...' : 'Call' }}
            </button>
            <a class="btn btn--book" :href="`https://calendly.com/arslan-khan-icustoms/30min`" target="_blank">
              <i class="fas fa-calendar-alt"></i>
              Consultation
            </a>
          </div>
        </div>
      </section>
    </template>

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

    <p v-if="status && !callActive" class="status">
      <span v-if="statusLoading" class="loading">
        <span>{{ status }}</span>
        <span class="loading-dots">
          <span></span><span></span><span></span>
        </span>
      </span>
      <span v-else>{{ status }}</span>
    </p>

    <!-- End-of-call popup -->
    <div v-if="showTranscriptPrompt" class="call-popup-overlay" role="dialog" aria-modal="true">
      <div class="call-popup">
        <div class="call-header">
          <div class="call-avatar"><i class="fas fa-file-alt"></i></div>
          <div class="call-info">
            <h3>Download summary?</h3>
            <p>We compiled your call with <strong>{{ currentDoctorName }}</strong> ({{ lastCallTimer }}).</p>
          </div>
        </div>
        <div class="call-actions" style="gap:12px">
          <button class="end-call-btn"
                  @click="downloadSummary"
                  :disabled="summarizing"
                  aria-label="Summarize & Download">
            <i class="fas" :class="summarizing ? 'fa-spinner fa-spin' : 'fa-file-alt'"></i>
          </button>
          <button class="cancel-btn" @click="showTranscriptPrompt = false">
            <i class="fas fa-times"></i> Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import Vapi from '@vapi-ai/web'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

const PUBLIC_KEY = 'c9773d29-c83b-4903-959a-d40a77793396'
let vapi

const doctors = ref([
  { id: 'dr-david', name: 'Dr. David Chen', specialty: 'Cardiology', assistantId: 'ba2f0969-4750-4190-a91f-2c5dc814bced' },
  { id: 'dr-miles', name: 'Dr. Miles Johnson', specialty: 'Oncology', assistantId: 'e225eced-43ba-474c-989e-4497e8f8588c' },
  { id: 'dr-morgan', name: 'Dr. Morgan Lee', specialty: 'Hematology', assistantId: '6ee484ac-18fb-401c-ba14-67a1a8ffc5d5' },
  { id: 'dr-taylor', name: 'Dr. Taylor Wilson', specialty: 'Gynecology', assistantId: '6b04a133-3158-4c3c-b5af-9f83b38efd56' },
  { id: 'dr-omaar', name: 'Dr. Omaar Ahmed', specialty: 'Ophthalmology', assistantId: 'e60bcf74-a1ab-4453-9ebc-77e01a90558a' },
  { id: 'dr-grace', name: 'Dr. Grace Kim', specialty: 'Dermatology', assistantId: 'c0c28d30-8e0d-4787-8072-e2cd6a1df032' },
  { id: 'dr-andrew', name: 'Dr. Andrew Park', specialty: 'Infectology', assistantId: 'c25e654b-4ad5-4e72-b6b0-49354fb8c957' },
  { id: 'dr-scarlett', name: 'Dr. Scarlett Davis', specialty: 'Orthopedics', assistantId: '10b4d79f-9e8a-4b18-b528-a8ff2ca4fb94' },
  { id: 'dr-nova', name: 'Dr. Nova Rodriguez', specialty: 'Psychiatry', assistantId: 'e4608542-a6c0-4517-8df0-72c539ea5014' },
  { id: 'dr-robert', name: 'Dr. Robert Brown', specialty: 'Gastroenterology', assistantId: '38523be1-eaa4-4f11-a418-4c7cccf20212' },
  { id: 'dr-daniel', name: 'Dr. Daniel Garcia', specialty: 'Pulmonology', assistantId: '2489de55-7d05-4282-ab89-acd44a1198c7' },
  { id: 'dr-williams', name: 'Dr. Williams Smith', specialty: 'Dentistry', assistantId: 'd43273a6-82e4-4462-ba07-72346e23e6f9' },
  { id: 'dr-susan', name: 'Dr. Susan Miller', specialty: 'Endocrinology', assistantId: '3ce663b3-2ac9-463e-a943-bac7b7b8ea0f' },
  { id: 'dr-emma', name: 'Dr. Emma Thompson', specialty: 'Urology', assistantId: '6a266708-6b19-4b92-92ad-832a2e960abd' },
  { id: 'dr-ellie', name: 'Dr. Ellie Clark', specialty: 'ENT Specialist', assistantId: '16cd535c-8137-40c8-aa94-40e19c103648' },
  { id: 'dr-michael', name: 'Dr. Michael Wright', specialty: 'Neurology', assistantId: '1c964479-ebe7-4fe7-b446-acb23173664e' },
  { id: 'dr-sophie', name: 'Dr. Sophie Martinez', specialty: 'General Practice', assistantId: '13e6ca08-cec8-4bff-816e-e5fbad4a633c' },
])

const callActive = ref(false)
const activeDoctorId = ref(null)
const status = ref('')
const statusLoading = ref(false)
const callTimer = ref('00:00')
const searchQuery = ref('')
const specialtyFilter = ref('')
const sortBy = ref('name')
const callProgress = ref(0)

const callState = ref('idle')
const isMuted = ref(false)
const isSpeakerOn = ref(false)
const isOnHold = ref(false)

const captions = ref([]) 
const captionsEl = ref(null)

const uploadingDoc = ref(false)
const uploadStatus = ref('')

// transcript & metadata
const finalTranscript = ref([])          // [{ role:'user'|'assistant', text:'...' }]
const showTranscriptPrompt = ref(false)  // popup
const callStartedAt = ref(null)          // header metadata
const lastCallTimer = ref('00:00')       // snapshot at end

// summary UI state
const summarizing = ref(false)
const CONSULTATION_URL = 'https://calendly.com/arslan-khan-icustoms/30min'
const suppressSummaryPopup = ref(false)

const currentDoctorName = computed(() => {
  const doctor = doctors.value.find(d => d.id === activeDoctorId.value)
  return doctor ? `${doctor.name} (${doctor.specialty})` : ''
})

const uniqueSpecialties = computed(() =>
  [...new Set(doctors.value.map(d => d.specialty))].sort()
)

const filteredDoctors = computed(() => {
  let result = [...doctors.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
  }
  if (specialtyFilter.value) {
    result = result.filter(d => d.specialty === specialtyFilter.value)
  }
  if (sortBy.value === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy.value === 'specialty') result.sort((a, b) => a.specialty.localeCompare(b.specialty))
  return result
})

const activeBubbleIdx = ref({ user: null, assistant: null })

function addCaption(role, text, final = false) {
  if (!text || !text.trim()) return
  const key = role === 'assistant' ? 'assistant' : 'user'
  const idx = activeBubbleIdx.value[key]
  if (idx !== null && captions.value[idx] && !captions.value[idx].final) {
    captions.value[idx].text = text
    captions.value[idx].final = final
    if (final) activeBubbleIdx.value[key] = null
  } else {
    const newIdx = captions.value.push({
      role: key,
      text,
      ts: Date.now(),
      final
    }) - 1
    if (!final) activeBubbleIdx.value[key] = newIdx
  }
  nextTick(() => {
    if (captionsEl.value) captionsEl.value.scrollTop = captionsEl.value.scrollHeight
  })
}

const startCall = async (doctor) => {
  finalTranscript.value = []
  showTranscriptPrompt.value = false
  callStartedAt.value = new Date()

  activeDoctorId.value = doctor.id
  callState.value = 'calling'
  callProgress.value = 0
  status.value = `Connecting to ${doctor.name}...`
  statusLoading.value = true
  captions.value = []

  const interval = setInterval(() => {
    if (callProgress.value < 100) callProgress.value += 10
    else clearInterval(interval)
  }, 300)

  try {
    await vapi.start(doctor.assistantId, {
      clientMessages: ['transcript', 'conversation-update', 'status-update', 'speech-update']
    })
    callState.value = 'active'
    callActive.value = true
    statusLoading.value = false
    startCallTimer()
  } catch (err) {
    handleVapiError(err)
    callState.value = 'idle'
    callActive.value = false
    statusLoading.value = false
  }
}

const handleCallEnd = () => {
  callState.value = 'idle'
  callActive.value = false
  clearInterval(timerInterval)
  lastCallTimer.value = callTimer.value
  status.value = `Call ended with ${currentDoctorName.value}`
  showTranscriptPrompt.value = !suppressSummaryPopup.value   // changed
  suppressSummaryPopup.value = false                         // reset
  setTimeout(() => (status.value = ''), 5000)
}
function openConsultation() {
  // prevent the summary popup for this path
  suppressSummaryPopup.value = true
  try { vapi?.stop() } catch (_) {}
  // open in a new tab safely
  window.open(CONSULTATION_URL, '_blank', 'noopener')
}
const stopCall = () => {
  try { vapi?.stop() } catch (_) {}
  handleCallEnd()
}

// ----- SUMMARY (client-only heuristic) -----
async function downloadSummary() {
  summarizing.value = true
  try {
    const doctor = currentDoctorName.value || 'Doctor'
    const started = callStartedAt.value ? callStartedAt.value.toLocaleString() : ''
    const duration = lastCallTimer.value || callTimer.value

    const lines = buildTranscriptLines()
    const summary = generateHeuristicSummary(lines)

    const header = `Consultation Summary — ${doctor}\nStarted: ${started}\nDuration: ${duration}\n\n`
    const content = header + (summary || 'Summary unavailable.') + '\n'

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const safeDoc = doctor.replace(/[^\w\-]+/g, '_')
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')
    const filename = `${safeDoc}__${stamp}__summary.md`

    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(a.href)
    a.remove()

    showTranscriptPrompt.value = false
  } finally {
    summarizing.value = false
  }
}

function buildTranscriptLines() {
  const lines = finalTranscript.value.length
    ? finalTranscript.value
    : captions.value.map(c => ({ role: c.role === 'assistant' ? 'assistant' : 'user', text: (c.text || '').trim() }))
  return lines.filter(l => l.text)
}

function generateHeuristicSummary(lines) {
  const user = []
  const doctor = []
  for (const l of lines) (l.role === 'assistant' ? doctor : user).push(l.text)

  const pick = (arr, limit = 5) => arr.filter(Boolean).slice(0, limit)

  const concernKw = /(pain|ache|fever|cough|rash|dizzy|nausea|vomit|fatigue|headache|shortness of breath|symptom|issue|problem|concern|since|for\s+\d)/i
  const chief = pick([...user.slice(0, 6), ...user.filter(t => concernKw.test(t))], 6)

  const histKw = /(since|for|after|because|history|previous|past|months?|weeks?|days?|years?)/i
  const history = pick(user.filter(t => histKw.test(t)), 6)

  const adviceKw = /(should|recommend|advise|suggest|try|consider|monitor|avoid|increase|decrease|start|stop|take|use|apply)/i
  const advice = pick(doctor.filter(t => adviceKw.test(t)), 8)

  const nextKw = /(next|follow[- ]?up|book|schedule|test|lab|scan|x-ray|mri|refer|see|appointment|blood|results)/i
  const next = pick(doctor.filter(t => nextKw.test(t)), 8)

  const questions = pick(user.filter(t => t.includes('?')).slice(-6), 6)

  const sec = (title, arr) =>
`## ${title}
${arr.length ? arr.map(t => `- ${t}`).join('\n') : '- (none noted)'}`

  return [
    '# Visit Summary',
    (chief.length ? chief : doctor.slice(0, 4)).slice(0, 6).map(t => `- ${t}`).join('\n') || '- (no highlights captured)',
    sec('Chief Concerns / Symptoms', chief),
    sec('History & Context', history),
    sec('Advice Given (non-diagnostic)', advice),
    sec('Next Steps / Follow-up', next),
    sec('Questions for Next Visit', questions)
  ].join('\n\n')
}

// --------------------------------

const cancelCall = () => {
  try { vapi?.stop() } catch (_) {}
  callState.value = 'idle'
  callActive.value = false
  status.value = 'Call canceled'
  setTimeout(() => (status.value = ''), 3000)
}

const toggleMute = () => { isMuted.value = !isMuted.value; isMuted.value ? vapi.mute() : vapi.unmute() }
const toggleSpeaker = () => { isSpeakerOn.value = !isSpeakerOn.value }
const toggleHold = () => { isOnHold.value = !isOnHold.value }

const handleVapiError = (err) => {
  const msg = typeof err === 'string' ? err : err?.message || String(err)
  console.error('VAPI error:', msg)
  status.value = `Error: ${msg}`
}

let timerInterval = null
let seconds = 0
const startCallTimer = () => {
  seconds = 0
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    seconds++
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    callTimer.value = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, 1000)
}

onMounted(() => {
  vapi = new Vapi(PUBLIC_KEY)
  vapi.on('call-start', () => { callState.value = 'active'; callActive.value = true; startCallTimer() })
  vapi.on('call-end', () => { handleCallEnd() })
  vapi.on('error', e => { handleVapiError(e?.error?.message || String(e?.error || e)) })

  vapi.on('message', (m) => {
    if (!m || !m.type) return

    if (m.type === 'transcript') {
      const role = m.role === 'assistant' ? 'assistant' : 'user'
      const text = (m.transcript || '').trim()
      const final = m?.transcriptType ? (m.transcriptType === 'final') : !!m?.isFinal

      addCaption(role, text, final)

      if (final && text) {
        finalTranscript.value.push({ role, text })
      }
    }

    if (m.type === 'conversation-update' && Array.isArray(m.conversation?.messages)) {
      const last = m.conversation.messages[m.conversation.messages.length - 1]
      if (last && last.role && typeof last.content === 'string') {
        const role = last.role === 'assistant' ? 'assistant' : 'user'
        const text = (last.content || '').trim()
        if (!text) return

        addCaption(role, text, true)

        const prev = finalTranscript.value[finalTranscript.value.length - 1]
        if (!prev || prev.text !== text || prev.role !== role) {
          finalTranscript.value.push({ role, text })
        }
      }
    }
  })

  status.value = 'Platform initialized. Select a doctor to start a call.'
  setTimeout(() => (status.value = ''), 5000)
})

// -------- PDF helpers --------
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let out = []
  let charCount = 0

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const txt = await page.getTextContent()
    const pageText = txt.items.map(t => t.str).join(" ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
    out.push(`\n\n--- Page ${i} of ${pdf.numPages} ---\n${pageText}`)
    charCount += pageText.length
  }

  let text = out.join("")
  if (charCount < 200) {
    text += "\n\n[Note: Very little text was extracted — this PDF might be scanned/images. Consider OCR first.]"
  }
  return text.trim()
}
function splitIntoChunks(str, chunkSize = 6000) {
  const chunks = []
  let i = 0
  while (i < str.length) {
    let end = Math.min(i + chunkSize, str.length)
    const windowStart = Math.max(i, end - 400)
    const nl = str.lastIndexOf('\n', end)
    const safeBreak = nl >= windowStart ? nl : end
    chunks.push(str.slice(i, safeBreak))
    i = safeBreak
  }
  return chunks.filter(Boolean)
}
async function sendTextIntoCall(text, filename) {
  if (!callActive.value) throw new Error("No active call")

  const CHUNK_SIZE = 6000
  const PAUSE_MS = 350

  const header = `User uploaded "${filename}". Use the following content to assist.`
  vapi.send({
    type: "add-message",
    message: { role: "user", content: header },
  })
  addCaption("user", header, true)

  const chunks = splitIntoChunks(text, CHUNK_SIZE)
  for (let i = 0; i < chunks.length; i++) {
    uploadStatus.value = `Sending PDF text… (${i + 1}/${chunks.length})`
    vapi.send({
      type: "add-message",
      message: { role: "user", content: chunks[i] },
    })
    addCaption("user", `[PDF chunk ${i + 1}/${chunks.length}]`, true)
    await new Promise(r => setTimeout(r, PAUSE_MS))
  }

  uploadStatus.value = "Done"
  setTimeout(() => (uploadStatus.value = ""), 1500)
}
async function handlePdfToCall(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!callActive.value) {
    status.value = "Start a call first, then upload."
    return
  }

  try {
    uploadingDoc.value = true
    uploadStatus.value = "Extracting text…"
    const text = await extractPdfText(file)

    const promptHeader =
      `Please incorporate the uploaded document while helping me.\n` +
      `If relevant, summarize key points first, then answer follow-ups.\n`

    await sendTextIntoCall(`${promptHeader}\n${text}`, file.name)
  } catch (err) {
    console.error(err)
    status.value = `Upload error: ${err?.message || err}`
  } finally {
    uploadingDoc.value = false
    e.target.value = ''
  }
}
</script>

<style scoped>
.call-popup-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(10px);
}
.call-popup {
  width: 90%; max-width: 420px;
  background: linear-gradient(135deg, #1e2a4a 0%, #0f1729 100%);
  border-radius: 24px; padding: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  text-align: center; color: #e6eeff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.call-header { margin-bottom: 26px; }
.call-avatar {
  width: 112px; height: 112px; margin: 0 auto 18px; border-radius: 50%;
  background: linear-gradient(135deg, #4a6fa5, #1a73e8);
  display: grid; place-items: center; font-size: 3.2rem;
  border: 3px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}
.call-info h3 { font-size: 1.6rem; margin: 0 0 6px; font-weight: 600; color: #fff; }
.call-info p { font-size: 1.05rem; color: #a9b7e7; }
.progress-container { margin: 26px 0; }
.progress-bar { height: 8px; background: rgba(255, 255, 255, 0.12); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
.progress-fill { height: 100%; background: linear-gradient(to right, #06b6d4, #22d3ee); border-radius: 4px; transition: width 0.3s ease; }
.call-controls { display: grid; grid-template-columns: repeat(4, minmax(90px, 1fr)); gap: 14px; margin: 6px 0 0; width: 100%; }
.control-btn {
  background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px; padding: 14px; min-width: 90px;
  display: flex; flex-direction: column; align-items: center;
  color: #e6eeff; font-size: 0.9rem; cursor: pointer; transition: all .25s ease;
}
.control-btn i { font-size: 1.6rem; margin-bottom: 8px; height: 40px; width: 40px; display: grid; place-items: center; border-radius: 50%; background: rgba(0, 0, 0, 0.25); }
.control-btn:hover { background: rgba(255, 255, 255, 0.18); transform: translateY(-2px); }
.call-actions { display: flex; justify-content: center; gap: 12px; }
.cancel-btn {
  background: rgba(255, 77, 79, 0.18); border: 1px solid rgba(255, 77, 79, 0.5);
  border-radius: 28px; padding: 10px 24px; color: #ff7a7c; font-size: 1rem; cursor: pointer; transition: all .25s ease;
}
.cancel-btn:hover { background: rgba(255, 77, 79, 0.28); }
.cancel-btn i { margin-right: 8px; }
.end-call-btn {
  background: #ff4d4f; border: none; border-radius: 50%;
  width: 70px; height: 70px; display: grid; place-items: center;
  color: #fff; font-size: 1.6rem; cursor: pointer; box-shadow: 0 10px 26px rgba(255, 77, 79, 0.35);
  transition: transform .2s ease;
}
.end-call-btn:hover { transform: scale(1.05); }
@keyframes popIn { from { opacity: 0; transform: translateY(26px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

.container {
  max-width: 1400px; margin: 0 auto;
  background: var(--panel-solid);
  border: 1px solid var(--ring);
  border-radius: 18px;
  box-shadow: 0 10px 34px rgba(0,0,0,.10);
  overflow: hidden;
}

.controls {
  padding: 20px 40px;
  display: flex; flex-wrap: wrap; gap: 20px; align-items: center;
  border-bottom: 1px solid var(--ring);
  background: var(--panel);
}

.search-box { flex: 1; max-width: 520px; position: relative; }
.search-box input {
  width: 100%; padding: 14px 20px 14px 48px;
  border-radius: 12px; border: 1px solid var(--ring);
  font-size: 1rem; background: var(--panel-solid); color: var(--text);
}
.search-box input::placeholder { color: var(--muted); }
.search-box input:focus {
  outline: none; border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 30%, transparent);
}
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); }

.filter-select {
  padding: 12px 16px; border-radius: 12px; border: 1px solid var(--ring);
  background: var(--panel-solid); color: var(--text); font-size: 1rem; cursor: pointer;
}

.section-title {
  padding: 18px 40px 10px;
  font-size: 1.45rem; font-weight: 600; color: var(--text);
  display: flex; align-items: center; gap: 10px;
}

.call-surface {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  padding: 24px 40px 36px;
  background: radial-gradient(1200px 600px at 30% -10%, #1a2748, #0b1224 60%, #070c18 100%);
  color: #e6eeff;
  min-height: 520px;
  border-top: 1px solid var(--ring);
}
@media (max-width: 980px) { .call-surface { grid-template-columns: 1fr; } }

.call-center {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 28px 22px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.vid-avatar {
  width: 160px; height: 160px; border-radius: 16px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #4a6fa5, #1a73e8);
  color: #fff; font-size: 4rem;
  box-shadow: 0 12px 28px rgba(0,0,0,.35);
  margin-bottom: 16px;
}
.call-title {
  margin: 0 0 8px; font-size: 1.4rem; font-weight: 600; color: #fff;
}
.call-timer-big {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(255,255,255,.08);
  font-weight: 600; color: #cfe2ff; margin-bottom: 18px;
}
.call-cta-row {
  display: inline-flex;
  grid-template-columns: repeat(5, minmax(90px, 1fr)); /* was 4 */
  gap: 14px; margin-top: 6px; width: 100%;
}
.round-cta {
  display: grid; place-items: center; gap: 6px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px; padding: 16px 10px; color: #e6eeff;
  cursor: pointer; transition: transform .15s ease, background .2s ease;
}
.round-cta i { font-size: 1.4rem; }
.round-cta:hover { transform: translateY(-2px); background: rgba(255,255,255,.18); }
.round-cta.end { background: #ff4d4f; border-color: #ff4d4f; }
.round-cta.end:hover { filter: brightness(1.05); }
.round-cta.consult { background: #1a73e8; border-color: #1a73e8; }

.chat-wrap {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex; flex-direction: column;
  min-height: 420px;
}
.bubble-list {
  overflow: auto;
  padding: 6px;
  display: flex; flex-direction: column; gap: 10px;
  max-height: 540px;
}
.bubble {
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 14px;
  position: relative;
  line-height: 1.35;
  word-wrap: break-word;
}
.bubble[data-role="assistant"] {
  align-self: flex-start;
  background: #0f2246;
  border: 1px solid rgba(86,144,255,.35);
  color: #e8f0ff;
}
.bubble[data-role="user"] {
  align-self: flex-end;
  background: #1a4d2e;
  border: 1px solid rgba(51, 225, 131, .35);
  color: #dbffec;
}
.bubble-meta {
  font-size: .75rem;
  opacity: .65;
  margin-bottom: 4px;
}
.bubble-text { font-size: .96rem; }
.cap-interim { opacity: .6; font-style: italic; }

.upload-row {
  display: flex; align-items: center; gap: 10px;
  align-self: stretch; margin: 6px 2px 2px;
}
.attach-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08);
  border: 1px dashed rgba(255,255,255,.24);
  padding: 10px 12px; border-radius: 12px;
  cursor: pointer; user-select: none; font-weight: 600; color: #e6eeff;
}
.attach-btn input { display: none; }
.upload-status { opacity: .8; font-size: .9rem; }

.doctor-grid { display: grid; gap: 24px; padding: 10px 40px 30px; grid-template-columns: 1fr; }
@media (min-width: 768px) { .doctor-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .doctor-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1400px) { .doctor-grid { grid-template-columns: repeat(4, 1fr); } }

.doctor-card {
  background: var(--panel-solid); border-radius: 14px; overflow: hidden;
  display: flex; flex-direction: column; height: 100%;
  border: 1px solid var(--ring);
  box-shadow: 0 8px 22px rgba(0,0,0,.08);
  transition: transform .18s ease, box-shadow .18s ease;
}
.doctor-card:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(0,0,0,.12); }

.doctor-header {
  background: linear-gradient(120deg, #4975c8, #1a73e8);
  color: #fff; padding: 16px;
  display: flex; align-items: center; gap: 12px;
}
:global(html.dark) .doctor-header {
  background: linear-gradient(120deg, #3f68b5, #195fd1);
}

.doctor-avatar {
  width: 56px; height: 56px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: grid; place-items: center; font-size: 1.5rem;
}
.doctor-info { flex: 1; }
.doctor-name { font-size: 1.06rem; font-weight: 600; letter-spacing: .2px; }
.doctor-specialty { font-size: .93rem; opacity: .95; margin-top: 2px; }

.doctor-details { padding: 14px 16px 8px; flex: 1; }
.detail-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: .95rem; color: var(--text); }
.detail-icon { color: var(--brand); width: 22px; text-align: center; }
.availability {
  display: flex; align-items: center; gap: 8px; margin-top: 10px; padding-top: 10px;
  border-top: 1px dashed var(--ring); font-size: .9rem;
  color: color-mix(in srgb, var(--brand) 25%, var(--text));
}
.availability-dot {
  width: 10px; height: 10px; border-radius: 50%; background: #22c55e;
  box-shadow: 0 0 0 4px color-mix(in srgb, #22c55e 20%, transparent);
}

.doctor-actions { display: flex; gap: 10px; padding: 12px 14px 16px; }
.doctor-actions .btn { flex: 1 1 0; min-width: 0; white-space: nowrap; text-align: center; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  border: none; border-radius: 12px; font-size: .95rem; font-weight: 600;
  cursor: pointer; padding: 10px 12px; flex: 1;
  transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
}
.btn i { margin-right: 8px; }
.btn--call {
  background: #22c55e; color: #fff;
  box-shadow: 0 4px 10px color-mix(in srgb, #22c55e 35%, transparent);
}
.btn--call:hover { background: #16a34a; box-shadow: 0 6px 14px color-mix(in srgb, #16a34a 40%, transparent); }
.btn--book {
  background: #ef4444; color: #fff !important; text-decoration: none;
  box-shadow: 0 4px 12px color-mix(in srgb, #ef4444 35%, transparent);
}
.btn--book:hover { background: #dc2626; box-shadow: 0 6px 16px color-mix(in srgb, #dc2626 40%, transparent); }

.active-call {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: var(--panel-solid); color: #ddd;
  padding: 12px 16px; border-radius: 12px; border: 1px solid var(--ring);
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,.22);
  z-index: 100;
}
.active-call__text { margin: 0; font-size: .94rem; }
.call-info { display: flex; align-items: center; gap: 10px; }
.call-timer { font-size: .9rem; }
.btn--end { background: #ff4d4f; color: #fff; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer; }

.status { text-align: center; padding: 14px; font-size: 1rem; color: #e6eeff; }
.loading { display: inline-flex; align-items: center; gap: 5px; color: #a9b7e7; }
.loading-dots span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: currentColor; margin: 0 2px; animation: pulse 1.5s infinite; }
.loading-dots span:nth-child(2) { animation-delay: .5s; }
.loading-dots span:nth-child(3) { animation-delay: 1s; }
@keyframes pulse { 0%, 60%, 100% { opacity: .35; transform: scale(.75); } 30% { opacity: 1; transform: scale(1); } }

.fade-in { animation: fadeIn .45s ease-out forwards; opacity: 0; }
@keyframes fadeIn { to { opacity: 1; } }
</style>

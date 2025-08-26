<template>
  <div class="chat-shell">
    <header class="chat-head">
      <div class="pic"><i class="fas fa-robot" /></div>
      <div class="who">
        <strong>{{ bot?.name || 'Chatbot' }}</strong>
        <small>{{ bot?.specialty }}</small>
      </div>
      <div class="spacer" />
      <button class="ghost" @click="goBack">
        <i class="fas fa-arrow-left" /> Back
      </button>
    </header>

    <section class="status-bar" v-if="status">
      <i class="fas" :class="statusIcon"></i>
      <span>{{ status }}</span>
    </section>

    <section class="messages" ref="scrollEl">
      <div
        v-for="(m, i) in msgs"
        :key="i + '-' + m.role + '-' + m.text.length"
        class="bubble"
        :data-role="m.role"
      >
        <div class="meta">{{ m.role === 'assistant' ? (bot?.name || 'Doctor') : 'You' }}</div>
        <div class="text">{{ m.text }}</div>
      </div>
    </section>

    <footer class="composer">
      <input
        v-model="draft"
        type="text"
        placeholder="Type your message…"
        :disabled="!connected"
        @keydown.enter.prevent="send"
      />
      <button class="send" :disabled="!draft.trim() || !connected" @click="send">
        <i class="fas fa-paper-plane" /> Send
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Vapi from '@vapi-ai/web'

const props = defineProps({
  initialBotId: { type: String, default: '' }
})

// ---- your 17 assistants (same ids as voice) ----
const bots = [
  { id: 'dr-david',    name: 'Dr. David Chen',     specialty: 'Cardiology',       assistantId: 'ba2f0969-4750-4190-a91f-2c5dc814bced' },
  { id: 'dr-miles',    name: 'Dr. Miles Johnson',  specialty: 'Oncology',         assistantId: 'e225eced-43ba-474c-989e-4497e8f8588c' },
  { id: 'dr-morgan',   name: 'Dr. Morgan Lee',     specialty: 'Hematology',       assistantId: '6ee484ac-18fb-401c-ba14-67a1a8ffc5d5' },
  { id: 'dr-taylor',   name: 'Dr. Taylor Wilson',  specialty: 'Gynecology',       assistantId: '6b04a133-3158-4c3c-b5af-9f83b38efd56' },
  { id: 'dr-omaar',    name: 'Dr. Omaar Ahmed',    specialty: 'Ophthalmology',    assistantId: 'e60bcf74-a1ab-4453-9ebc-77e01a90558a' },
  { id: 'dr-grace',    name: 'Dr. Grace Kim',      specialty: 'Dermatology',      assistantId: 'c0c28d30-8e0d-4787-8072-e2cd6a1df032' },
  { id: 'dr-andrew',   name: 'Dr. Andrew Park',    specialty: 'Infectology',      assistantId: 'c25e654b-4ad5-4e72-b6b0-49354fb8c957' },
  { id: 'dr-scarlett', name: 'Dr. Scarlett Davis', specialty: 'Orthopedics',      assistantId: '10b4d79f-9e8a-4b18-b528-a8ff2ca4fb94' },
  { id: 'dr-nova',     name: 'Dr. Nova Rodriguez', specialty: 'Psychiatry',       assistantId: 'e4608542-a6c0-4517-8df0-72c539ea5014' },
  { id: 'dr-robert',   name: 'Dr. Robert Brown',   specialty: 'Gastroenterology', assistantId: '38523be1-eaa4-4f11-a418-4c7cccf20212' },
  { id: 'dr-daniel',   name: 'Dr. Daniel Garcia',  specialty: 'Pulmonology',      assistantId: '2489de55-7d05-4282-ab89-acd44a1198c7' },
  { id: 'dr-williams', name: 'Dr. Williams Smith', specialty: 'Dentistry',        assistantId: 'd43273a6-82e4-4462-ba07-72346e23e6f9' },
  { id: 'dr-susan',    name: 'Dr. Susan Miller',   specialty: 'Endocrinology',    assistantId: '3ce663b3-2ac9-463e-a943-bac7b7b8ea0f' },
  { id: 'dr-emma',     name: 'Dr. Emma Thompson',  specialty: 'Urology',          assistantId: '6a266708-6b19-4b92-92ad-832a2e960abd' },
  { id: 'dr-ellie',    name: 'Dr. Ellie Clark',    specialty: 'ENT Specialist',   assistantId: '16cd535c-8137-40c8-aa94-40e19c103648' },
  { id: 'dr-michael',  name: 'Dr. Michael Wright', specialty: 'Neurology',        assistantId: '1c964479-ebe7-4fe7-b446-acb23173664e' },
  { id: 'dr-sophie',   name: 'Dr. Sophie Martinez',specialty: 'General Practice', assistantId: '13e6ca08-cec8-4bff-816e-e5fbad4a633c' },
]
const bot = computed(() => bots.find(b => b.id === props.initialBotId) || null)

const PUBLIC_KEY = 'c9773d29-c83b-4903-959a-d40a77793396'
let vapi = null

// UI state
const msgs = ref([])
const draft = ref('')
const status = ref('')
const connected = ref(false)
const scrollEl = ref(null)
const statusIcon = computed(() => {
  if (status.value.includes('Connecting')) return 'fa-spinner fa-spin'
  if (status.value.includes('Error')) return 'fa-exclamation-triangle'
  return 'fa-info-circle'
})

function push(role, text) {
  if (!text?.trim()) return
  const prev = msgs.value[msgs.value.length - 1]
  if (prev && prev.role === role && prev.text === text) return
  msgs.value.push({ role, text: text.trim() })
  nextTick(() => {
    scrollEl.value && (scrollEl.value.scrollTop = scrollEl.value.scrollHeight)
  })
}

/* ----- BLOCK ANY AUDIO (client-side) ----- */
let audioObserver = null
function killAllAudioElements() {
  const audios = document.querySelectorAll('audio')
  audios.forEach(a => {
    try { a.muted = true; a.volume = 0; a.pause(); if ('srcObject' in a) a.srcObject = null; a.removeAttribute('autoplay') } catch (_) {}
  })
}
function startAudioGuard() {
  killAllAudioElements()
  audioObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes?.forEach(node => {
        if (node?.nodeName?.toLowerCase() === 'audio') {
          try { node.muted = true; node.volume = 0; node.pause(); if ('srcObject' in node) node.srcObject = null; node.removeAttribute('autoplay') } catch (_) {}
        }
        if (node?.querySelectorAll) {
          node.querySelectorAll('audio').forEach(a => {
            try { a.muted = true; a.volume = 0; a.pause(); if ('srcObject' in a) a.srcObject = null; a.removeAttribute('autoplay') } catch (_) {}
          })
        }
      })
    }
  })
  audioObserver.observe(document.body, { childList: true, subtree: true })
}
function stopAudioGuard() { try { audioObserver?.disconnect() } catch(_) {} audioObserver = null }

/* ----- STREAMING CAPTURE (Realtime-style) ----- */
let liveAssistant = '' // accumulate delta text

function handleStreamingMessage(m) {
  // Streamed text chunks
  if (m.type === 'response.output_text.delta' && typeof m.delta === 'string') {
    if (!liveAssistant) {
      // start a new assistant bubble
      push('assistant', '')
    }
    liveAssistant += m.delta
    // patch last assistant message text
    const last = msgs.value[msgs.value.length - 1]
    if (last && last.role === 'assistant') last.text = liveAssistant
    return true
  }

  // Stream finished
  if (m.type === 'response.output_text.done' || m.type === 'response.completed') {
    liveAssistant = ''
    return true
  }

  return false
}

/* ----- SESSION ----- */
async function startSession() {
  if (!bot.value?.assistantId) {
    status.value = 'Error: Missing assistantId for this bot.'
    return
  }

  try {
    status.value = `Connecting to ${bot.value.name}…`
    vapi = new Vapi(PUBLIC_KEY)

    vapi.on('error', (e) => {
      status.value = `Error: ${e?.error?.message || e?.message || String(e)}`
    })

    vapi.on('call-start', () => {
      connected.value = true
      status.value = `Connected to ${bot.value.name} (chat only)`
      startAudioGuard()

      // Tell the assistant to answer in TEXT only (extra hint)
      try {
        vapi.send({ type: 'add-message', message: { role: 'user', content: 'Please respond in TEXT only. Do not speak.' } })
      } catch {}
    })

    vapi.on('call-end', () => {
      connected.value = false
      status.value = 'Session ended'
      stopAudioGuard()
    })

    vapi.on('message', (m) => {
      if (!m || !m.type) return

      // 1) Prefer streaming events if present
      if (handleStreamingMessage(m)) return

      // 2) Fallback: conversation updates (voice-style)
      if (m.type === 'conversation-update' && Array.isArray(m.conversation?.messages)) {
        const last = m.conversation.messages[m.conversation.messages.length - 1]
        if (last && typeof last.content === 'string') {
          const role = last.role === 'assistant' ? 'assistant' : 'user'
          push(role, last.content)
        }
      }
    })

    // Ask server to send both conversation + streaming signals
    await vapi.start(bot.value.assistantId, {
      clientMessages: [
        'conversation-update',
        'response.create',
        'response.output_text.delta',
        'response.output_text.done',
        'response.completed',
        'status-update'
      ]
    })

    killAllAudioElements()
  } catch (err) {
    status.value = `Error: ${err?.message || String(err)}`
  }
}

function send() {
  const text = draft.value.trim()
  if (!text || !connected.value) return
  push('user', text)
  draft.value = ''
  try {
    // Voice-style pathway
    vapi.send({ type: 'add-message', message: { role: 'user', content: text } })
  } catch {}
  try {
    // Realtime-style pathway
    vapi.send({ type: 'input_text', text })
  } catch {}
}

function goBack() {
  try { vapi?.stop() } catch (_) {}
  stopAudioGuard()
  const ev = new CustomEvent('navigate', { detail: 'chatbots' })
  window.dispatchEvent(ev)
}

onMounted(() => {
  push('assistant', `Hi! I'm ${bot.value?.name || 'your AI doctor'}. How can I help today?`)
  startSession()
})
onBeforeUnmount(() => { try { vapi?.stop() } catch (_) {} stopAudioGuard() })
</script>

<style scoped>
.chat-shell {
  display: grid; grid-template-rows: auto auto 1fr auto;
  border: 1px solid var(--ring); border-radius: 16px;
  background: var(--panel-solid); box-shadow: var(--shadow-1);
  height: calc(100dvh - 180px); max-height: 840px;
}
.chat-head { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--ring); }
.pic { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center;
  background: color-mix(in srgb, var(--brand) 16%, transparent); color: var(--brand); }
.who strong { display: block; color: var(--text); }
.who small { color: var(--muted); }
.spacer { flex: 1; }
.ghost { border: 1px solid var(--ring); background: var(--ghost-bg); color: var(--text); border-radius: 10px; padding: 8px 10px; cursor: pointer; }

.status-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px dashed var(--ring); color: var(--muted); }
.status-bar i { width: 16px; text-align: center; }

.messages { overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.bubble { max-width: 78%; padding: 10px 12px; border-radius: 14px; line-height: 1.35; }
.bubble[data-role="assistant"] { align-self: flex-start; background: #0f2246; color: #e8f0ff; border: 1px solid rgba(86,144,255,.35); }
.bubble[data-role="user"] { align-self: flex-end; background: #1a4d2e; color: #dbffec; border: 1px solid rgba(51,225,131,.35); }
.meta { font-size: .75rem; opacity: .7; margin-bottom: 4px; }
.text { white-space: pre-wrap; }

.composer { display: grid; grid-template-columns: 1fr auto; gap: 10px; border-top: 1px solid var(--ring); padding: 10px; }
.composer input { width: 100%; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--ring); background: var(--panel); color: var(--text); }
.send { display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 12px; padding: 10px 14px;
        background: linear-gradient(135deg,var(--brand),var(--brand-2)); color: #fff; cursor: pointer; }
.send:disabled { opacity: .5; cursor: not-allowed; }
</style>

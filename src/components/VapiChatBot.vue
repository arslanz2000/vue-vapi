<template>
  <div class="chat">
    <header class="chat__bar">
      <span>Dr. Chat — General Physician</span>
      <small v-if="model">· {{ model }}</small>
    </header>

    <main class="chat__body" ref="scrollEl">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="msg"
        :data-role="m.role"
      >
        <div class="msg__bubble">
          <div class="msg__role">{{ m.role === 'user' ? 'You' : 'Doctor' }}</div>

          <!-- Render text + (optional) inline images for each message -->
          <template v-if="Array.isArray(m.content)">
            <template v-for="(part, pi) in m.content" :key="pi">
              <p v-if="part?.type === 'text'" class="msg__text">{{ part.text }}</p>
              <img
                v-else-if="part?.type === 'image_url' && part?.image_url?.url"
                class="msg__img"
                :src="part.image_url.url"
                alt="uploaded"
              />
            </template>
          </template>
          <p v-else class="msg__text">{{ m.content }}</p>
        </div>
      </div>

      <div v-if="loading" class="msg" data-role="assistant">
        <div class="msg__bubble">
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </main>

    <form class="composer" @submit.prevent="send">
      <!-- attachments -->
      <div class="attach">
        <label class="attach__btn" title="Attach image(s)">
          <input
            type="file"
            accept="image/*"
            multiple
            @change="onPickImages"
          />
          <i class="fas fa-paperclip" aria-hidden="true"></i>
          <span>Image</span>
        </label>

        <div v-if="pendingImages.length" class="thumbs">
          <div v-for="(p, idx) in pendingImages" :key="idx" class="thumb">
            <img :src="p.url" alt="preview" />
            <button type="button" class="thumb__x" @click="removePending(idx)" aria-label="Remove image">×</button>
          </div>
        </div>
      </div>

      <!-- input -->
      <input
        v-model="input"
        :disabled="loading"
        placeholder="Describe symptoms or ask a question… (you can attach images like rashes, reports)"
        autocomplete="off"
      />
      <button class="send" :disabled="!canSend || loading" title="Send">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

// ====== CONFIG ======
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const API_URL = 'https://api.openai.com/v1/chat/completions'
// Vision-capable, affordable model
const model = 'gpt-4o-mini'

// System prompt so replies sound like a general physician
const SYSTEM_PROMPT = `You are a licensed general physician. Answer as a doctor would: empathetic, clear, and evidence-based. 
- Ask concise clarifying questions when needed.
- Provide general guidance and red-flag advice; do not diagnose definitively without examination.
- Suggest when to seek urgent care.
- Keep answers concise with short paragraphs or bullet points.`

// ====== STATE ======
const messages = ref([
  { role: 'assistant', content: 'Hello—I\'m your virtual general physician. How can I help you today?' }
])
const input = ref('')
const loading = ref(false)
const error = ref('')
const scrollEl = ref(null)

// Pending image attachments (data URLs for preview + sending)
const pendingImages = ref([]) // [{ url, file }]

const canSend = computed(() => input.value.trim().length || pendingImages.value.length)

// ====== HELPERS ======
const scrollToBottom = async () => {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function onPickImages(e) {
  const files = Array.from(e.target?.files || [])
  if (!files.length) return
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue
    // Optional: cap size at ~8MB to keep requests snappy
    if (f.size > 8 * 1024 * 1024) { continue }
    fileToDataUrl(f).then(url => pendingImages.value.push({ url, file: f }))
  }
  // reset input so re-selecting same file triggers change
  e.target.value = ''
}

function removePending(idx) {
  pendingImages.value.splice(idx, 1)
}

// Build OpenAI message array with system + prior conversation
function buildPayloadMessages() {
  const prior = messages.value.map(m => {
    // Normalize each message to Chat Completions format
    if (Array.isArray(m.content)) return { role: m.role, content: m.content }
    return { role: m.role, content: [{ type: 'text', text: String(m.content || '') }] }
  })

  return [
    { role: 'system', content: [{ type: 'text', text: SYSTEM_PROMPT }] },
    ...prior
  ]
}

// ====== ACTIONS ======
async function send() {
  const text = input.value.trim()
  if (!text && !pendingImages.value.length) return
  if (loading.value) return
  error.value = ''

  // Construct a multimodal user message (text + image parts)
  const userContent = []
  if (text) userContent.push({ type: 'text', text })
  for (const p of pendingImages.value) {
    userContent.push({ type: 'image_url', image_url: { url: p.url } })
  }

  // Show user message immediately in UI
  messages.value.push({ role: 'user', content: userContent.length ? userContent : [{ type: 'text', text: '' }] })
  input.value = ''
  pendingImages.value = []
  loading.value = true
  await scrollToBottom()

  try {
    const payload = {
      model,
      messages: [
        ...buildPayloadMessages(),
        { role: 'user', content: userContent }
      ],
      temperature: 0.7,
      max_tokens: 600
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const info = await res.json().catch(() => ({}))
      throw new Error(info?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content
    const replyText = Array.isArray(reply)
      ? reply.filter(p => p?.type === 'text').map(p => p.text).join('\n\n')
      : (reply || '')

    messages.value.push({ role: 'assistant', content: replyText || '(no reply)' })
  } catch (e) {
    console.error(e)
    error.value = `Request failed: ${e.message}`
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
/* layout */
.chat { max-width: 820px; margin: 24px auto; background: var(--panel-solid, #0b1220);
        border: 1px solid var(--ring, #1d263a); border-radius: 16px; display: grid;
        grid-template-rows: auto 1fr auto; height: 76vh; box-shadow: 0 8px 28px rgba(0,0,0,.18); }
.chat__bar { display:flex; align-items:center; gap:8px; padding:12px 16px;
            background: linear-gradient(120deg, #23345a, #1a73e8); color:#fff; font-weight:600; border-top-left-radius:16px; border-top-right-radius:16px; }
.chat__body { overflow:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }

/* messages */
.msg { display:flex; }
.msg[data-role="user"] { justify-content: flex-end; }
.msg__bubble { max-width: 72%; padding: 12px 14px; border-radius: 14px; line-height: 1.4; box-shadow: 0 6px 18px rgba(0,0,0,.12); }
.msg[data-role="assistant"] .msg__bubble { background:#0f2246; border:1px solid rgba(86,144,255,.35); color:#e8f0ff; }
.msg[data-role="user"] .msg__bubble { background:#1a4d2e; border:1px solid rgba(51,225,131,.35); color:#dbffec; }
.msg__role { font-size:.75rem; opacity:.7; margin-bottom:4px; }
.msg__text { white-space: pre-wrap; word-break: break-word; margin: 0 0 8px; }
.msg__img { display:block; max-width: 240px; max-height: 240px; border-radius: 10px; border: 1px solid rgba(255,255,255,.18); margin: 6px 0; }

/* typing dots */
.dots { display:inline-flex; gap:4px; align-items:center; }
.dots span { width:8px; height:8px; background: currentColor; opacity:.85; border-radius:50%; animation: bounce 1.2s infinite; }
.dots span:nth-child(2){ animation-delay:.2s } .dots span:nth-child(3){ animation-delay:.4s }
@keyframes bounce { 0%, 80%, 100% { transform: translateY(0) } 40% { transform: translateY(-4px) } }

/* composer */
.composer { display:grid; grid-template-columns: auto 1fr auto; gap:10px; align-items:start; padding:12px; border-top:1px solid var(--ring, #1d263a); background: var(--panel, #0f172a); }
.composer input { padding:12px 14px; border-radius:12px; border:1px solid var(--ring, #1d263a); background: var(--panel-solid, #0b1220); color: var(--text, #e6eeff); }
.send { width:46px; height:46px; border:0; border-radius:12px; background:#22c55e; color:#fff; display:grid; place-items:center; cursor:pointer; box-shadow:0 6px 16px rgba(34,197,94,.35); }
.send:disabled { filter: grayscale(.5) brightness(.85); cursor:not-allowed; }

/* attachments */
.attach { display:flex; flex-direction:column; gap:8px; }
.attach__btn { display:inline-flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:#e6eeff; cursor:pointer; font-weight:600; }
.attach__btn input { display:none; }
.thumbs { display:flex; flex-wrap:wrap; gap:8px; max-width: 240px; }
.thumb { position:relative; }
.thumb img { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,.18); }
.thumb__x { position:absolute; top:-6px; right:-6px; width:20px; height:20px; border:0; border-radius:50%; background:#ef4444; color:#fff; cursor:pointer; }

.error { grid-column: 1 / -1; color:#ffb4b4; background: rgba(255,0,0,.08); border:1px solid rgba(255,0,0,.22); padding:8px 10px; border-radius:10px; margin: 8px 12px; }
</style>

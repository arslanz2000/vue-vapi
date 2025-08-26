<template>
  <div class="hub">
    <h2 class="title">
      <i class="fas fa-comments"></i>
      AI Chatbots
    </h2>

    <div class="grid">
      <div
        v-for="(bot, i) in bots"
        :key="bot.id"
        class="card"
        :style="{ animationDelay: `${i * 0.05}s` }"
      >
        <div class="card-head">
          <div class="avatar"><i class="fas fa-robot" /></div>
          <div class="meta">
            <p class="name">{{ bot.name }}</p>
            <p class="spec">{{ bot.specialty }}</p>
          </div>
        </div>

        <div class="card-body">
          <p class="desc">Chat with a {{ bot.specialty }} specialist.</p>
        </div>

        <div class="card-actions">
          <button class="btn primary" @click="$emit('openChat', bot.id)">
            <i class="fas fa-comments"></i>
            Open Chat
          </button>
          <a
            class="btn ghost"
            :href="`https://calendly.com/arslan-khan-icustoms/30min`"
            target="_blank"
          >
            <i class="fas fa-calendar-alt"></i>
            Consultation
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
.hub { display: grid; gap: 14px; }
.title {
  display: flex; align-items: center; gap: 10px;
  margin: 0; font-size: 1.4rem; color: var(--text);
}
.grid {
  display: grid; gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.card {
  border: 1px solid var(--ring);
  background: var(--panel-solid);
  border-radius: 14px;
  box-shadow: var(--shadow-1);
  padding: 14px;
  animation: fadeIn .35s ease-out both;
}
.card-head { display: flex; gap: 12px; align-items: center; }
.avatar {
  width: 48px; height: 48px; border-radius: 12px;
  display: grid; place-items: center;
  background: color-mix(in srgb, var(--brand) 16%, transparent);
  color: var(--brand);
}
.meta .name { margin: 0; font-weight: 600; color: var(--text); }
.meta .spec { margin: 2px 0 0; color: var(--muted); font-size: .9rem; }
.card-body { margin-top: 8px; color: var(--muted); }
.card-actions { display: flex; gap: 8px; margin-top: 12px; }
.btn {
  display: inline-flex; align-items: center; gap: 8px; justify-content: center;
  padding: 9px 12px; border-radius: 12px; cursor: pointer; flex: 1;
  border: 1px solid var(--ring);
}
.primary { background: linear-gradient(135deg,var(--brand),var(--brand-2)); color: #fff; border: 0; }
.ghost { background: var(--ghost-bg); color: var(--text); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>

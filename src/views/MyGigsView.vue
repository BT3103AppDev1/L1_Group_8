<template>
  <div class="page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-inner">
        <h1 class="page-title">My Gigs</h1>
        <p class="page-subtitle">Track gigs you've applied for or are currently fulfilling</p>
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="tab-bar">
      <div class="tab-inner">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tabCount(tab.key) > 0" class="tab-badge">{{ tabCount(tab.key) }}</span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="content">

      <!-- ── AWAITING ── -->
      <div v-if="activeTab === 'awaiting'">
        <div v-if="gigs.awaiting.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-title">No pending applications</p>
          <p class="empty-sub">Browse the Explore page to find gigs that match your skills.</p>
        </div>

        <div v-for="gig in gigs.awaiting" :key="gig.id" class="card" :class="{ 'card-rejected': gig.status === 'rejected' }">
          <div class="card-header">
            <div class="card-meta-row">
              <span :class="['tag', categoryTag(gig.category)]">{{ gig.category }}</span>
              <span v-if="gig.status === 'pending'" class="badge badge-awaiting">Pending Review</span>
              <span v-else-if="gig.status === 'rejected'" class="badge badge-rejected">Rejected</span>
            </div>
            <h3 class="card-title">{{ gig.title }}</h3>
            <div class="card-meta">
              <span>📍 {{ gig.location }}</span>
              <span>💰 {{ gig.pay }}</span>
              <span>📅 {{ gig.date }}</span>
            </div>
          </div>

          <!-- Lister info -->
          <div class="lister-row">
            <div class="avatar">{{ gig.lister.initials }}</div>
            <div class="lister-info">
              <span class="lister-name">{{ gig.lister.name }}</span>
              <span class="lister-sub">Listed by</span>
            </div>
          </div>

          <!-- Rejected message -->
          <div v-if="gig.status === 'rejected'" class="reject-note">
            <span>Your application was not selected. This listing will be removed from your list in {{ gig.daysUntilRemoval }} days.</span>
          </div>

          <!-- Applied note -->
          <div v-if="gig.status === 'pending'" class="info-note">
            Applied {{ gig.appliedDate }} · Waiting for the lister to review your application.
          </div>

          <div class="card-actions">
            <button
              v-if="gig.status === 'pending'"
              class="btn btn-danger-outline btn-sm"
              @click="openWithdraw(gig)"
            >Withdraw Application</button>
            <button
              v-else-if="gig.status === 'rejected'"
              class="btn btn-outline btn-sm"
              @click="openRemove(gig)"
            >Remove</button>
          </div>
        </div>
      </div>

      <!-- ── ONGOING ── -->
      <div v-if="activeTab === 'ongoing'">
        <div v-if="gigs.ongoing.length === 0" class="empty-state">
          <div class="empty-icon">🚀</div>
          <p class="empty-title">No ongoing gigs</p>
          <p class="empty-sub">Once a lister accepts your application, the gig will appear here.</p>
        </div>

        <div v-for="gig in gigs.ongoing" :key="gig.id" class="card">
          <div class="card-header">
            <div class="card-meta-row">
              <span :class="['tag', categoryTag(gig.category)]">{{ gig.category }}</span>
              <span class="badge badge-ongoing">Ongoing</span>
            </div>
            <h3 class="card-title">{{ gig.title }}</h3>
            <div class="card-meta">
              <span>📍 {{ gig.location }}</span>
              <span>💰 {{ gig.pay }}</span>
              <span>📅 {{ gig.date }}</span>
            </div>
          </div>

          <!-- Lister info -->
          <div class="lister-row">
            <div class="avatar">{{ gig.lister.initials }}</div>
            <div class="lister-info">
              <span class="lister-name">{{ gig.lister.name }}</span>
              <span class="lister-sub">Requested by · <span class="stars">{{ gig.lister.rating }}</span> ({{ gig.lister.gigsCount }} gigs)</span>
            </div>
            <button class="btn btn-outline btn-sm" @click="showToast('Profile view coming soon!')">View Profile</button>
          </div>

          <div class="info-note">
            Both you and the lister must mark the gig as complete before it is finalised.
          </div>

          <div class="card-actions">
            <button class="btn btn-primary btn-sm" @click="openMarkComplete(gig)">Mark as Completed</button>
            <button class="btn btn-outline btn-sm" @click="showToast('Chat coming soon!')">Message Lister</button>
          </div>
        </div>
      </div>

      <!-- ── COMPLETED ── -->
      <div v-if="activeTab === 'completed'">
        <div v-if="gigs.completed.length === 0" class="empty-state">
          <div class="empty-icon">🏆</div>
          <p class="empty-title">No completed gigs yet</p>
          <p class="empty-sub">Complete your first gig to start building your reputation and earning points!</p>
        </div>

        <div v-for="gig in gigs.completed" :key="gig.id" class="card card-done">
          <div class="card-header">
            <div class="card-meta-row">
              <span :class="['tag', categoryTag(gig.category)]">{{ gig.category }}</span>
              <span class="badge badge-completed">Completed</span>
            </div>
            <h3 class="card-title">{{ gig.title }}</h3>
            <div class="card-meta">
              <span>📍 {{ gig.location }}</span>
              <span>💰 {{ gig.pay }}</span>
              <span>📅 {{ gig.date }}</span>
            </div>
          </div>

          <!-- Lister info -->
          <div class="lister-row">
            <div class="avatar avatar-done">{{ gig.lister.initials }}</div>
            <div class="lister-info">
              <span class="lister-name">{{ gig.lister.name }}</span>
              <span class="lister-sub">Lister</span>
            </div>
          </div>

          <!-- Rating received -->
          <div class="rating-row">
            <div class="rating-block">
              <span class="rating-label">Rating received</span>
              <span class="stars">{{ gig.ratingReceived }}</span>
            </div>
            <div class="points-block">
              <span class="points-label">Points earned</span>
              <span class="points-value">+{{ gig.pointsEarned }} pts</span>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /content -->

    <!-- Toast -->
    <div v-if="toast.show" class="toast">{{ toast.message }}</div>

    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="modal.show"
      :icon="modal.icon"
      :title="modal.title"
      :message="modal.message"
      :confirmLabel="modal.confirmLabel"
      :confirmClass="modal.confirmClass"
      @confirm="handleConfirm"
      @cancel="modal.show = false"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'

export default {
  name: 'MyGigsView',
  components: { ConfirmModal },

  data() {
    return {
      activeTab: 'awaiting',
      tabs: [
        { key: 'awaiting',  label: 'Awaiting' },
        { key: 'ongoing',   label: 'Ongoing' },
        { key: 'completed', label: 'Completed' },
      ],

      toast: { show: false, message: '' },
      modal: {
        show: false, icon: '', title: '', message: '',
        confirmLabel: 'Confirm', confirmClass: 'btn-primary',
        _fn: null,
      },

      gigs: {
        awaiting: [
          {
            id: 101,
            status: 'pending',
            category: 'Education',
            title: 'Help with CS2040S problem sets (Week 8–10)',
            location: 'COM1 Study Area',
            pay: '$30 / session',
            date: 'Flexible this week',
            appliedDate: '3 days ago',
            lister: { initials: 'TW', name: 'Tan Wei Liang' },
          },
          {
            id: 102,
            status: 'pending',
            category: 'Buddy',
            title: 'Gym buddy for morning sessions at UTown Rec',
            location: 'UTown Recreation Centre',
            pay: '$0 (mutual)',
            date: 'Mon / Wed / Fri mornings',
            appliedDate: '1 day ago',
            lister: { initials: 'SR', name: 'Siti Rahayu' },
          },
          {
            id: 103,
            status: 'rejected',
            category: 'Survival',
            title: 'Urgent: Return library books before fine kicks in',
            location: 'Central Library',
            pay: '$10 flat',
            date: 'ASAP',
            appliedDate: '5 days ago',
            daysUntilRemoval: 2,
            lister: { initials: 'LJ', name: 'Lee Jun Hao' },
          },
        ],
        ongoing: [
          {
            id: 201,
            category: 'Education',
            title: 'Weekly tutoring sessions for MA1521',
            location: 'Science Library, Level 2',
            pay: '$25 / hr',
            date: 'Every Saturday 2–4 pm',
            lister: {
              initials: 'PY',
              name: 'Priya Nair',
              rating: '★★★★★',
              gigsCount: 12,
            },
          },
        ],
        completed: [
          {
            id: 301,
            category: 'Survival',
            title: 'Queue for Add/Drop tutorial slots (CS3216)',
            location: 'Online / NUSMods',
            pay: '$15',
            date: '14 Jan 2026',
            lister: { initials: 'BK', name: 'Bryan Koh' },
            ratingReceived: '★★★★★',
            pointsEarned: 150,
          },
          {
            id: 302,
            category: 'Buddy',
            title: 'Accompaniment to medical appointment at UHC',
            location: 'University Health Centre',
            pay: '$20',
            date: '2 Feb 2026',
            lister: { initials: 'AC', name: 'Aisha Chong' },
            ratingReceived: '★★★★☆',
            pointsEarned: 120,
          },
        ],
      },
    }
  },

  methods: {
    tabCount(key) {
      return this.gigs[key]?.length ?? 0
    },

    categoryTag(cat) {
      return {
        Education: 'tag-education',
        Buddy:     'tag-buddy',
        Survival:  'tag-survival',
      }[cat] ?? 'tag-gray'
    },

    showToast(msg) {
      this.toast = { show: true, message: msg }
      setTimeout(() => { this.toast.show = false }, 2200)
    },

    openWithdraw(gig) {
      this.modal = {
        show: true,
        icon: '↩️',
        title: 'Withdraw application?',
        message: `You will lose your spot for "${gig.title}". You can re-apply later if the listing is still open.`,
        confirmLabel: 'Yes, withdraw',
        confirmClass: 'btn-danger',
        _fn: () => {
          this.gigs.awaiting = this.gigs.awaiting.filter(g => g.id !== gig.id)
          this.showToast('Application withdrawn.')
        },
      }
    },

    openRemove(gig) {
      this.modal = {
        show: true,
        icon: '🗑️',
        title: 'Remove from list?',
        message: `"${gig.title}" will be removed from your gig list.`,
        confirmLabel: 'Remove',
        confirmClass: 'btn-danger',
        _fn: () => {
          this.gigs.awaiting = this.gigs.awaiting.filter(g => g.id !== gig.id)
          this.showToast('Removed from your list.')
        },
      }
    },

    openMarkComplete(gig) {
      this.modal = {
        show: true,
        icon: '✅',
        title: 'Mark gig as completed?',
        message: `Confirm that you have finished "${gig.title}". The lister will also need to confirm before points are awarded.`,
        confirmLabel: 'Yes, I\'m done',
        confirmClass: 'btn-primary',
        _fn: () => {
          const done = this.gigs.ongoing.find(g => g.id === gig.id)
          this.gigs.ongoing = this.gigs.ongoing.filter(g => g.id !== gig.id)
          if (done) {
            this.gigs.completed.unshift({
              ...done,
              ratingReceived: '—',
              pointsEarned: 0,
            })
          }
          this.showToast('Marked as complete! Waiting for lister confirmation.')
        },
      }
    },

    handleConfirm() {
      this.modal._fn?.()
      this.modal.show = false
    },
  },
}
</script>

<style scoped>
/* ── Layout ── */
.page { background: var(--bg, #F4F6F9); min-height: 100vh; }

.page-header {
  background: var(--primary, #003D7C);
  padding: 32px max(2rem, 7vw);
}
.header-inner { max-width: 860px; margin: 0 auto; }
.page-title   { color: #fff; font-size: 26px; font-weight: 800; margin: 0 0 6px; }
.page-subtitle { color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; }

/* ── Tabs ── */
.tab-bar  { background: #fff; border-bottom: 1px solid #E5E7EB; position: sticky; top: 60px; z-index: 50; }
.tab-inner { max-width: 860px; margin: 0 auto; display: flex; gap: 4px; padding: 0 max(2rem, 7vw); }

.tab-btn {
  position: relative;
  padding: 14px 20px 12px;
  font-size: 14px; font-weight: 600;
  color: #6E6E6E;
  background: none; border: none; cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color .15s, border-color .15s;
  display: flex; align-items: center; gap: 7px;
}
.tab-btn:hover { color: #1D1D1D; }
.tab-btn.active { color: var(--primary, #003D7C); border-bottom-color: var(--primary, #003D7C); }

.tab-badge {
  background: var(--secondary, #EF7C00); color: #fff;
  font-size: 11px; font-weight: 700;
  padding: 1px 6px; border-radius: 20px;
  line-height: 16px;
}

/* ── Content ── */
.content { max-width: 860px; margin: 0 auto; padding: 28px max(2rem, 7vw) 60px; display: flex; flex-direction: column; gap: 18px; }

/* ── Cards ── */
.card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 22px 24px;
  display: flex; flex-direction: column; gap: 14px;
  transition: box-shadow .15s;
}
.card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.08); }
.card-done { opacity: 0.72; }
.card-rejected { border-left: 4px solid var(--error, #DC3545); }

.card-header { display: flex; flex-direction: column; gap: 6px; }
.card-meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.card-title { font-size: 16px; font-weight: 700; color: #1D1D1D; margin: 0; }
.card-meta  { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: #6E6E6E; }

/* ── Lister row ── */
.lister-row {
  display: flex; align-items: center; gap: 12px;
  background: #F8F9FB; border-radius: 10px; padding: 12px 14px;
}
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--primary, #003D7C); color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.avatar-done { background: #9CA3AF; }
.lister-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.lister-name { font-size: 14px; font-weight: 600; color: #1D1D1D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lister-sub  { font-size: 12px; color: #6E6E6E; }

/* ── Reject / pending notes ── */
.reject-note {
  background: #FFF1F1; border: 1px solid #FECACA;
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; color: #B91C1C;
}

/* ── Rating row ── */
.rating-row {
  display: flex; gap: 24px; flex-wrap: wrap;
  background: #F8F9FB; border-radius: 10px; padding: 12px 16px;
}
.rating-block, .points-block { display: flex; flex-direction: column; gap: 3px; }
.rating-label, .points-label { font-size: 11px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.points-value { font-size: 16px; font-weight: 800; color: var(--secondary, #EF7C00); }

/* ── Actions ── */
.card-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 64px 24px; }
.empty-icon  { font-size: 48px; margin-bottom: 16px; }
.empty-title { font-size: 17px; font-weight: 700; color: #1D1D1D; margin: 0 0 8px; }
.empty-sub   { font-size: 14px; color: #6E6E6E; margin: 0; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1D1D1D; color: #fff;
  padding: 12px 24px; border-radius: 40px;
  font-size: 14px; font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 500;
  animation: slide-up .2s ease;
}
@keyframes slide-up {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>

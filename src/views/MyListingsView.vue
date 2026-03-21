<template>
  <div class="view">

    <!-- ── Tab Header ── -->
    <div class="tab-header">
      <div class="tab-header-inner">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-badge">{{ listings[tab.key].length }}</span>
        </button>
      </div>
    </div>

    <!-- ── Content ── -->
    <div class="content">

<<<<<<< HEAD
      <!-- Page title -->
      <h2 class="page-title">{{ tabTitle }}</h2>
=======
      <!-- Top bar -->
      <div class="topbar">
        <h2 class="page-title">{{ tabTitle }}</h2>
        <button class="btn btn-secondary" @click="showToast('Navigating to Create Listing...')">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          Post a Listing
        </button>
      </div>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857

      <!-- Empty state -->
      <div v-if="listings[activeTab].length === 0" class="empty-state">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <circle cx="26" cy="26" r="24" stroke="#B5B5B5" stroke-width="2"/>
          <path d="M18 26h16M26 18v16" stroke="#B5B5B5" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p class="empty-title">Nothing here yet</p>
        <p class="empty-sub">{{ emptyMsg }}</p>
      </div>

      <!-- ════ AWAITING TAB ════ -->
      <template v-if="activeTab === 'awaiting'">
        <article v-for="listing in listings.awaiting" :key="listing.id" class="card">
          <!-- Card head -->
          <div class="card-head">
            <div class="card-info">
              <span :class="['cat-tag', catClass(listing.category)]">{{ listing.category }}</span>
              <h3 class="card-title">{{ listing.title }}</h3>
              <div class="card-meta">
<<<<<<< HEAD
                <span class="meta-item">Posted On: {{ listing.createdAt }}</span>
=======
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ listing.location }}
                </span>
<<<<<<< HEAD
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="showToast('View Listing Details — coming soon!')">View Listing Details</button>
          </div>

=======
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1a5 5 0 100 10A5 5 0 008 1zM1 8a7 7 0 1114 0A7 7 0 011 8z" fill="#6E6E6E"/><path d="M8 4v4l2.5 1.5" stroke="#6E6E6E" stroke-width="1.2" stroke-linecap="round"/></svg>
                  {{ listing.createdAt }}
                </span>
                <span class="status-badge badge-awaiting">● Awaiting</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-outline btn-sm" @click="showToast('Edit Listing — coming soon!')">Edit</button>
              <button class="btn btn-danger-outline btn-sm" @click="openDelete(listing)">Delete</button>
            </div>
          </div>

          <hr class="divider">
          <p class="desc"><strong>Description:</strong> {{ listing.description }}</p>

>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
          <!-- Applicants -->
          <div class="applicants">
            <div class="applicants-head">Applicants ({{ listing.applicants.length }})</div>

            <div v-if="listing.applicants.length === 0" class="no-applicants">
              <p class="no-applicants-title">No applicants yet</p>
              <p class="no-applicants-sub">Your listing is live — check back soon!</p>
            </div>

            <div v-else class="applicant-list">
              <div v-for="a in listing.applicants" :key="a.id" class="applicant-row">
                <div class="avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                <div class="applicant-info">
                  <span class="applicant-name" @click="showToast('View profile: ' + a.name)">{{ a.name }}</span>
<<<<<<< HEAD
                </div>
                <button class="btn btn-primary btn-sm" @click="openChoose(listing, a)">Choose This Provider</button>
              </div>
            </div>
          </div>
=======
                  <span class="applicant-sub">
                    <span class="stars">{{ stars(a.rating) }}</span>
                    {{ a.rating.toFixed(1) }} &bull; {{ a.gigs }} gigs completed
                  </span>
                </div>
                <div class="applicant-btns">
                  <button class="btn btn-outline btn-sm" @click="showToast('View profile: ' + a.name)">View Profile</button>
                  <button class="btn btn-secondary btn-sm" @click="openChoose(listing, a)">Choose This Provider</button>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button class="btn btn-outline btn-sm" @click="showToast('View Listing Details')">View Listing Details</button>
          </div>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
        </article>
      </template>

      <!-- ════ ONGOING TAB ════ -->
      <template v-if="activeTab === 'ongoing'">
        <article v-for="listing in listings.ongoing" :key="listing.id" class="card">
          <div class="card-head">
            <div class="card-info">
<<<<<<< HEAD
=======
              <span :class="['cat-tag', catClass(listing.category)]">{{ listing.category }}</span>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
              <h3 class="card-title">{{ listing.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ listing.location }}
                </span>
<<<<<<< HEAD
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="showToast('View Listing Details — coming soon!')">View Listing Details</button>
=======
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1a5 5 0 100 10A5 5 0 008 1zM1 8a7 7 0 1114 0A7 7 0 011 8z" fill="#6E6E6E"/><path d="M8 4v4l2.5 1.5" stroke="#6E6E6E" stroke-width="1.2" stroke-linecap="round"/></svg>
                  {{ listing.createdAt }}
                </span>
                <span class="status-badge badge-ongoing">● Ongoing</span>
              </div>
            </div>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
          </div>

          <!-- Assigned provider -->
          <div class="applicants">
            <div class="applicants-head">Your Provider</div>
            <div class="applicant-row">
              <div class="avatar" :style="{ background: listing.provider.color }">{{ listing.provider.initials }}</div>
              <div class="applicant-info">
                <span class="applicant-name" @click="showToast('View profile: ' + listing.provider.name)">
                  {{ listing.provider.name }}
                </span>
<<<<<<< HEAD
              </div>
              <span class="waiting-note">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="#9CA3AF" stroke-width="1.5"/><path d="M8 5v3.5l2 1" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/></svg>
                Waiting for provider to complete
              </span>
=======
                <span class="applicant-sub">
                  <span class="stars">{{ stars(listing.provider.rating) }}</span>
                  {{ listing.provider.rating.toFixed(1) }}
                </span>
              </div>
              <span class="info-note">ℹ Waiting for provider to complete</span>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
            </div>
          </div>

          <div class="card-footer card-footer-right">
<<<<<<< HEAD
=======
            <button class="btn btn-outline btn-sm" @click="showToast('View Listing Details')">View Listing Details</button>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
            <button class="btn btn-primary btn-sm" @click="openMarkComplete(listing)">Mark as Completed</button>
          </div>
        </article>
      </template>

      <!-- ════ COMPLETED TAB ════ -->
      <template v-if="activeTab === 'completed'">
<<<<<<< HEAD
        <article v-for="listing in listings.completed" :key="listing.id" class="card">
          <div class="card-head">
            <div class="card-info">
              <span :class="['cat-tag', catClass(listing.category)]">{{ listing.category }}</span>
              <h3 class="card-title">{{ listing.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">Posted On: {{ listing.createdAt }}</span>
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ listing.location }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="showToast('View Listing Details — coming soon!')">View Listing Details</button>
          </div>

          <div class="applicants">
            <div class="applicants-head">Your Provider</div>
            <div class="applicant-row">
              <div class="avatar" :style="{ background: listing.provider.color ?? '#9CA3AF' }">{{ listing.provider.initials ?? listing.provider.name.slice(0,2).toUpperCase() }}</div>
              <div class="applicant-info">
                <span class="applicant-name">{{ listing.provider.name }}</span>
              </div>
            </div>
=======
        <article v-for="listing in listings.completed" :key="listing.id" class="card greyed">
          <div class="card-head">
            <div class="card-info">
              <span class="cat-tag tag-gray">{{ listing.category }}</span>
              <h3 class="card-title">{{ listing.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">{{ listing.location }}</span>
                <span class="meta-item">{{ listing.createdAt }}</span>
                <span class="status-badge badge-completed">● Completed</span>
              </div>
            </div>
          </div>
          <hr class="divider">
          <p class="desc">
            <strong>Provider:</strong> {{ listing.provider.name }}
            &nbsp;&bull;&nbsp;
            <strong>Rated:</strong>
            <span class="stars">{{ stars(listing.ratingGiven) }}</span>
            {{ listing.ratingGiven }}.0
          </p>
          <div class="card-footer">
            <button class="btn btn-outline btn-sm" @click="showToast('View Listing Details')">View Listing Details</button>
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
          </div>
        </article>
      </template>

    </div><!-- /content -->

    <!-- Toast notification -->
    <div v-if="toast.show" class="toast">{{ toast.text }}</div>

    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="modal.show"
      :icon="modal.icon"
      :title="modal.title"
      :message="modal.message"
      :confirm-label="modal.confirmLabel"
      :confirm-class="modal.confirmClass"
      @confirm="handleConfirm"
      @cancel="modal.show = false"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/ConfirmModal.vue'

export default {
  name: 'MyListingsView',
  components: { ConfirmModal },

  data() {
    return {
      activeTab: 'awaiting',
      tabs: [
        { key: 'awaiting',  label: 'Awaiting' },
        { key: 'ongoing',   label: 'Ongoing' },
        { key: 'completed', label: 'Completed' },
      ],
      toast: { show: false, text: '' },
      modal: { show: false, icon: '', title: '', message: '', confirmLabel: '', confirmClass: '', _fn: null },

<<<<<<< HEAD
=======
      // ── Mock data (will be replaced with Firestore calls) ──
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
      listings: {
        awaiting: [
          {
            id: 'l1',
<<<<<<< HEAD
            title: 'Need someone to help carry heavy items to UTown',
            category: 'Survival',
            location: 'University Health Centre',
            createdAt: '29 February 2026',
            applicants: [
              { id: 'u1', name: 'Minh Hoang',  initials: 'MH', color: '#3B82F6' },
              { id: 'u2', name: 'Zhao En',     initials: 'ZE', color: '#6366F1' },
              { id: 'u3', name: 'Ruoyi',       initials: 'RY', color: '#3B82F6' },
=======
            title: 'Help carry heavy items to UTown',
            category: 'Survival',
            location: "Prince George's Park Residences",
            createdAt: '24 Feb 2026, 9:00 AM',
            description: 'I have about 6 boxes to move from PGP to UTown. Looking for someone with a trolley or strong arms — will take about 1 hour.',
            applicants: [
              { id: 'u1', name: 'James Lim',      initials: 'JL', color: '#003D7C', rating: 4.9, gigs: 12 },
              { id: 'u2', name: 'Sarah Rajan',     initials: 'SR', color: '#EF7C00', rating: 4.5, gigs: 7  },
              { id: 'u3', name: 'Muhammad Haziq',  initials: 'MH', color: '#28A745', rating: 5.0, gigs: 3  },
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
            ],
          },
          {
            id: 'l2',
            title: 'CS2040S Study Buddy Needed for Finals Week',
            category: 'Education',
            location: 'COM1 Level 2 Study Area',
<<<<<<< HEAD
            createdAt: '23 February 2026',
=======
            createdAt: '23 Feb 2026, 2:00 PM',
            description: 'Looking for someone strong in graphs and DP. Willing to trade notes in return! Session is about 2 hours.',
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
            applicants: [],
          },
        ],
        ongoing: [
          {
            id: 'l3',
<<<<<<< HEAD
            title: 'Print and collect documents from UTown Starbucks',
            category: 'Survival',
            location: 'University Town',
            createdAt: '29 February 2026',
            provider: { name: 'Minh Hoang', initials: 'MH', color: '#3B82F6' },
=======
            title: 'Print and collect documents from COM1 office',
            category: 'Survival',
            location: 'COM1, Level 1',
            createdAt: '24 Feb 2026, 11:00 AM',
            provider: { name: 'Sarah Rajan', initials: 'SR', color: '#EF7C00', rating: 4.5 },
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
          },
        ],
        completed: [
          {
            id: 'l4',
<<<<<<< HEAD
            title: 'Print and collect documents from UTown Starbucks',
            category: 'Survival',
            location: 'University Town',
            createdAt: '29 February 2026',
            provider: { name: 'Minh Hoang', initials: 'MH', color: '#3B82F6' },
=======
            title: 'Tapao lunch from The Deck for me please',
            category: 'Survival',
            location: 'The Deck, University Cultural Centre',
            createdAt: '19 Feb 2026, 11:30 AM',
            provider: { name: 'James Lim' },
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
            ratingGiven: 5,
          },
        ],
      },
    }
  },

  computed: {
    tabTitle() {
<<<<<<< HEAD
      return { awaiting: 'Awaiting Services', ongoing: 'Ongoing Services', completed: 'Completed Services' }[this.activeTab]
=======
      return { awaiting: 'Awaiting Applications', ongoing: 'Ongoing Services', completed: 'Completed Services' }[this.activeTab]
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
    },
    emptyMsg() {
      return {
        awaiting:  'Post a listing to find someone who can help!',
        ongoing:   'No ongoing services right now.',
        completed: 'Your completed services will appear here.',
      }[this.activeTab]
    },
  },

  methods: {
    catClass(category) {
      return { Education: 'tag-education', Buddy: 'tag-buddy', Survival: 'tag-survival' }[category] ?? 'tag-gray'
    },
<<<<<<< HEAD
=======
    stars(r) {
      const n = Math.round(r)
      return '★'.repeat(n) + '☆'.repeat(5 - n)
    },
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
    showToast(text) {
      this.toast = { show: true, text }
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => { this.toast.show = false }, 2200)
    },
    handleConfirm() {
      this.modal._fn?.()
      this.modal.show = false
    },

<<<<<<< HEAD
=======
    openDelete(listing) {
      this.modal = {
        show: true, icon: '🗑️',
        title: 'Delete this listing?',
        message: 'This action cannot be undone. The listing and all its applications will be permanently removed.',
        confirmLabel: 'Delete Listing', confirmClass: 'btn-danger',
        _fn: () => {
          this.listings.awaiting = this.listings.awaiting.filter(l => l.id !== listing.id)
          this.showToast('Listing deleted successfully!')
        },
      }
    },

>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
    openChoose(listing, applicant) {
      this.modal = {
        show: true, icon: '✅',
        title: `Choose ${applicant.name}?`,
        message: 'Once you accept this provider, all other applicants will be automatically rejected. This cannot be undone.',
        confirmLabel: 'Accept Provider', confirmClass: 'btn-primary',
        _fn: () => {
          const idx = this.listings.awaiting.findIndex(l => l.id === listing.id)
          if (idx !== -1) {
            const moved = { ...listing, provider: applicant }
            this.listings.awaiting.splice(idx, 1)
            this.listings.ongoing.unshift(moved)
            this.activeTab = 'ongoing'
            this.showToast(`${applicant.name} accepted as your provider!`)
          }
        },
      }
    },

    openMarkComplete(listing) {
      this.modal = {
        show: true, icon: '🎉',
        title: 'Mark as Completed?',
        message: 'Confirm that the service has been fulfilled. You will then be prompted to rate your provider.',
        confirmLabel: 'Mark Completed', confirmClass: 'btn-primary',
        _fn: () => {
          const idx = this.listings.ongoing.findIndex(l => l.id === listing.id)
          if (idx !== -1) {
            const moved = { ...listing, ratingGiven: 5 }
            this.listings.ongoing.splice(idx, 1)
            this.listings.completed.unshift(moved)
            this.activeTab = 'completed'
            this.showToast('Service marked as completed!')
          }
        },
      }
    },
  },
}
</script>

<style scoped>
/* ── Layout ── */
<<<<<<< HEAD
.view { display: flex; flex-direction: column; min-height: calc(100vh - 64px); }
=======
.view { display: flex; flex-direction: column; min-height: calc(100vh - 60px); }
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857

/* ── Tab Header ── */
.tab-header {
  background: #fff;
  border-bottom: 1px solid #E5E9EF;
}
.tab-header-inner {
  max-width: 1100px;
  margin: 0 auto;
<<<<<<< HEAD
=======
  padding: 0 max(2rem, 7vw);
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
  display: flex;
  gap: 4px;
}
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #6E6E6E;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover:not(.active) { color: #1D1D1D; }
.tab-btn.active { color: #003D7C; font-weight: 700; border-bottom-color: #003D7C; }
.tab-badge {
  background: #B5B5B5;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
  transition: background 0.15s;
}
.tab-btn.active .tab-badge { background: #003D7C; }

/* ── Content ── */
.content {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
<<<<<<< HEAD
  padding: 28px 0;
}
.page-title { font-size: 20px; font-weight: 700; color: #003D7C; margin-bottom: 22px; }
=======
  padding: 28px max(2rem, 7vw);
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.page-title { font-size: 20px; font-weight: 700; color: #003D7C; }
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857

/* ── Empty state ── */
.empty-state { text-align: center; padding: 64px 20px; color: #8C8C8C; }
.empty-state svg { display: block; margin: 0 auto 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: #4F4F4F; margin-bottom: 6px; }
.empty-sub   { font-size: 13px; }

/* ── Card ── */
.card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #E5E9EF;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  margin-bottom: 20px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.11); }
<<<<<<< HEAD
=======
.card.greyed { opacity: 0.65; filter: grayscale(0.2); }
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 14px;
  gap: 16px;
}
.card-info { flex: 1; }
<<<<<<< HEAD
.card-title { font-size: 16px; font-weight: 700; color: #1D1D1D; margin: 4px 0 6px; line-height: 24px; }
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
=======
.card-title { font-size: 16px; font-weight: 700; color: #1D1D1D; margin-bottom: 6px; line-height: 24px; }
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
  align-items: center;
  font-size: 13px;
  color: #6E6E6E;
}
.meta-item { display: inline-flex; align-items: center; gap: 4px; }
<<<<<<< HEAD
=======
.card-actions { display: flex; gap: 8px; flex-shrink: 0; }

.divider { border: none; border-top: 1px solid #F0F2F5; margin: 0 20px; }
.desc { padding: 12px 20px; font-size: 13px; color: #4F4F4F; line-height: 20px; }
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857

.card-footer {
  display: flex;
  align-items: center;
  padding: 10px 20px 14px;
  gap: 8px;
}
.card-footer-right { justify-content: flex-end; }

<<<<<<< HEAD
/* ── Applicants / Provider section ── */
=======
/* ── Applicants ── */
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
.applicants { background: #F8F9FB; border-top: 1px solid #E5E9EF; padding: 14px 20px; }
.applicants-head {
  font-size: 11px;
  font-weight: 700;
  color: #6E6E6E;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 12px;
}
.no-applicants { text-align: center; padding: 16px 0; }
.no-applicants-title { font-size: 14px; font-weight: 600; color: #4F4F4F; }
.no-applicants-sub   { font-size: 12px; color: #8C8C8C; margin-top: 2px; }

.applicant-list { display: flex; flex-direction: column; gap: 8px; }
.applicant-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #E5E9EF;
  border-radius: 6px;
  padding: 10px 14px;
  transition: border-color 0.15s;
}
.applicant-row:hover { border-color: #003D7C; }

.avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
<<<<<<< HEAD
.applicant-info { flex: 1; }
.applicant-name {
  font-size: 14px; font-weight: 600;
  color: #003D7C;
  cursor: pointer;
  transition: opacity 0.15s;
}
.applicant-name:hover { opacity: 0.75; text-decoration: underline; }

/* ── Waiting note ── */
.waiting-note {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #9CA3AF;
  white-space: nowrap;
}
=======
.applicant-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.applicant-name {
  font-size: 14px; font-weight: 600; color: #1D1D1D;
  cursor: pointer;
  transition: color 0.15s;
}
.applicant-name:hover { color: #003D7C; text-decoration: underline; }
.applicant-sub { font-size: 12px; color: #6E6E6E; display: flex; align-items: center; gap: 4px; }
.applicant-btns { display: flex; gap: 8px; align-items: center; }
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #1D1D1D;
  color: #fff;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  animation: slide-up 0.2s ease;
}
@keyframes slide-up {
  from { transform: translateX(-50%) translateY(10px); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
}

@media (max-width: 768px) {
  .card-head { flex-direction: column; }
<<<<<<< HEAD
  .applicant-row { flex-wrap: wrap; }
=======
  .card-actions { justify-content: flex-end; }
  .applicant-row { flex-wrap: wrap; }
  .applicant-btns { width: 100%; justify-content: flex-end; }
>>>>>>> 3f902e9c38079a41362c8059cee803da9cb1a857
}
</style>

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
          <span class="tab-badge">{{ gigs[tab.key].length }}</span>
        </button>
      </div>
    </div>

    <!-- ── Content ── -->
    <div class="content">

      <!-- Page title -->
      <h2 class="page-title">{{ tabTitle }}</h2>

      <!-- Loading state -->
      <div v-if="loading" class="empty-state">
        <p class="empty-title">Loading...</p>
      </div>

      <!-- ════ AWAITING TAB ════ -->
      <template v-if="!loading && activeTab === 'awaiting'">
        <div v-if="gigs.awaiting.length === 0" class="empty-state">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle cx="26" cy="26" r="24" stroke="#B5B5B5" stroke-width="2"/>
            <path d="M18 26h16M26 18v16" stroke="#B5B5B5" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p class="empty-title">No pending applications</p>
          <p class="empty-sub">Browse the Explore page to find gigs that match your skills.</p>
        </div>

        <article v-for="gig in gigs.awaiting" :key="gig.id" class="card">
          <!-- Dismiss X for rejected -->
          <button
            v-if="gig.status === 'rejected'"
            class="card-dismiss"
            title="Dismiss"
            @click="openRemove(gig)"
          >✕</button>

          <!-- Card head -->
          <div class="card-head">
            <div class="card-info">
              <span :class="['cat-tag', catClass(gig.category)]">{{ gig.category }}</span>
              <h3 class="card-title">{{ gig.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">Posted On: {{ gig.postedOn }}</span>
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ gig.location }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="showToast('View Listing Details — coming soon!')">View Listing Details</button>
          </div>

          <!-- Pending: Withdraw button -->
          <div v-if="gig.status === 'pending'" class="card-body">
            <button class="btn btn-danger-outline btn-sm" @click="openWithdraw(gig)">Withdraw</button>
          </div>

          <!-- Rejected: status + auto-remove -->
          <div v-if="gig.status === 'rejected'" class="card-body card-body-row">
            <span class="badge-rejected-pill">● Rejected</span>
            <span class="auto-remove">Auto-remove in <strong>{{ gig.daysUntilRemoval }} days</strong></span>
          </div>
        </article>
      </template>

      <!-- ════ ONGOING TAB ════ -->
      <template v-if="!loading && activeTab === 'ongoing'">
        <div v-if="gigs.ongoing.length === 0" class="empty-state">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle cx="26" cy="26" r="24" stroke="#B5B5B5" stroke-width="2"/>
            <path d="M18 26h16M26 18v16" stroke="#B5B5B5" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p class="empty-title">No ongoing gigs</p>
          <p class="empty-sub">Once a lister accepts your application, the gig will appear here.</p>
        </div>

        <article v-for="gig in gigs.ongoing" :key="gig.id" class="card">
          <div class="card-head">
            <div class="card-info">
              <span :class="['cat-tag', catClass(gig.category)]">{{ gig.category }}</span>
              <h3 class="card-title">{{ gig.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">Posted On: {{ gig.postedOn }}</span>
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ gig.location }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="showToast('View Listing Details — coming soon!')">View Listing Details</button>
          </div>

          <div class="card-body">
            <span class="waiting-pill">Waiting for Lister Confirmation</span>
          </div>
        </article>
      </template>

      <!-- ════ COMPLETED TAB ════ -->
      <template v-if="!loading && activeTab === 'completed'">
        <div v-if="gigs.completed.length === 0" class="empty-state">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle cx="26" cy="26" r="24" stroke="#B5B5B5" stroke-width="2"/>
            <path d="M18 26h16M26 18v16" stroke="#B5B5B5" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p class="empty-title">No completed gigs yet</p>
          <p class="empty-sub">Complete your first gig to start building your reputation!</p>
        </div>

        <article v-for="gig in gigs.completed" :key="gig.id" class="card">
          <div class="card-head">
            <div class="card-info">
              <span :class="['cat-tag', catClass(gig.category)]">{{ gig.category }}</span>
              <h3 class="card-title">{{ gig.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">Posted On: {{ gig.postedOn }}</span>
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ gig.location }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="showToast('View Listing Details — coming soon!')">View Listing Details</button>
          </div>
        </article>
      </template>

    </div><!-- /content -->

    <!-- Toast notification -->
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
import { db, auth } from '@/firebase.js'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

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
      modal: { show: false, icon: '', title: '', message: '', confirmLabel: 'Confirm', confirmClass: 'btn-primary', _fn: null },
      loading: false,

      gigs: {
        awaiting:  [],
        ongoing:   [],
        completed: [],
      },
    }
  },

  async mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return
      this.loading = true
      try {
        const listingsRef = collection(db, 'listings')

        // Awaiting: listings where user is in applicants array and still open
        const awaitingSnap = await getDocs(
          query(listingsRef, where('applicants', 'array-contains', user.uid), where('status', '==', 'Awaiting'))
        )

        // Ongoing: listings where user is the accepted provider
        const ongoingSnap = await getDocs(
          query(listingsRef, where('provider_id', '==', user.uid), where('status', '==', 'Ongoing'))
        )

        // Completed: listings where user was the provider and job is done
        const completedSnap = await getDocs(
          query(listingsRef, where('provider_id', '==', user.uid), where('status', '==', 'Completed'))
        )

        const mapGig = (doc) => {
          const d = doc.data()
          return {
            id: doc.id,
            status: 'pending',
            category: d.listing_category,
            title: d.title,
            location: d.location_text,
            postedOn: d.created_at?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '',
          }
        }

        this.gigs.awaiting  = awaitingSnap.docs.map(mapGig)
        this.gigs.ongoing   = ongoingSnap.docs.map(mapGig)
        this.gigs.completed = completedSnap.docs.map(mapGig)
      } catch (e) {
        console.error('Failed to load gigs:', e)
      } finally {
        this.loading = false
      }
    })
  },

  computed: {
    tabTitle() {
      return {
        awaiting:  'Applied & Awaiting Decision',
        ongoing:   'Currently Helping With',
        completed: 'Completed Gigs',
      }[this.activeTab]
    },
  },

  methods: {
    catClass(category) {
      return { Education: 'tag-education', Buddy: 'tag-buddy', Survival: 'tag-survival' }[category] ?? 'tag-gray'
    },

    showToast(msg) {
      this.toast = { show: true, message: msg }
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => { this.toast.show = false }, 2200)
    },

    handleConfirm() {
      this.modal._fn?.()
      this.modal.show = false
    },

    openWithdraw(gig) {
      this.modal = {
        show: true, icon: '↩️',
        title: 'Withdraw application?',
        message: `You will lose your spot for "${gig.title}". You can re-apply later if the listing is still open.`,
        confirmLabel: 'Yes, withdraw', confirmClass: 'btn-danger',
        _fn: () => {
          this.gigs.awaiting = this.gigs.awaiting.filter(g => g.id !== gig.id)
          this.showToast('Application withdrawn.')
        },
      }
    },

    openRemove(gig) {
      this.modal = {
        show: true, icon: '🗑️',
        title: 'Remove from list?',
        message: `"${gig.title}" will be removed from your gig list.`,
        confirmLabel: 'Remove', confirmClass: 'btn-danger',
        _fn: () => {
          this.gigs.awaiting = this.gigs.awaiting.filter(g => g.id !== gig.id)
          this.showToast('Removed from your list.')
        },
      }
    },
  },
}
</script>

<style scoped>
/* ── Layout ── */
.view { display: flex; flex-direction: column; min-height: calc(100vh - 64px); }

/* ── Tab Header ── */
.tab-header {
  background: #fff;
  border-bottom: 1px solid #E5E9EF;
}
.tab-header-inner {
  max-width: 1100px;
  margin: 0 auto;
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
  padding: 28px 0;
}
.page-title { font-size: 20px; font-weight: 700; color: #003D7C; margin-bottom: 22px; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 64px 20px; color: #8C8C8C; }
.empty-state svg { display: block; margin: 0 auto 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: #4F4F4F; margin-bottom: 6px; }
.empty-sub   { font-size: 13px; }

/* ── Card ── */
.card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #E5E9EF;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  margin-bottom: 20px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.11); }

/* Dismiss X button (rejected cards) */
.card-dismiss {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid #D1D5DB;
  background: #F9FAFB;
  color: #6B7280;
  font-size: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  z-index: 1;
}
.card-dismiss:hover { background: #FEE2E2; color: #DC2626; border-color: #FCA5A5; }

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 14px;
  gap: 16px;
}
/* Push content away from the dismiss X on rejected cards */
.card:has(.card-dismiss) .card-head { padding-right: 52px; }

.card-info { flex: 1; }
.card-title { font-size: 16px; font-weight: 700; color: #1D1D1D; margin: 4px 0 6px; line-height: 24px; }
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #6E6E6E;
}
.meta-item { display: inline-flex; align-items: center; gap: 4px; }

/* ── Card body (below head) ── */
.card-body {
  padding: 0 20px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.card-body-row { flex-direction: row; }

/* ── Withdraw btn lives in card-body ── */

/* ── Rejected status ── */
.badge-rejected-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #DC2626;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 999px;
}
.auto-remove {
  font-size: 13px;
  color: #6B7280;
}
.auto-remove strong { color: #1D1D1D; }

/* ── Waiting pill (ongoing) ── */
.waiting-pill {
  display: inline-flex;
  align-items: center;
  background: #F3F4F6;
  color: #2D6A6A;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #E5E7EB;
}

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
  .card:has(.card-dismiss) .card-head { padding-right: 20px; }
}
</style>

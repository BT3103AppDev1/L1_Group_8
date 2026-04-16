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

      <!-- Page title -->
      <h2 class="page-title">{{ tabTitle }}</h2>

      <!-- Loading state -->
      <div v-if="loading" class="empty-state">
        <p class="empty-title">Loading...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="listings[activeTab].length === 0" class="empty-state">
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
                <span class="meta-item">Posted On: {{ listing.createdAt }}</span>
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ listing.location }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary" @click="$router.push('/listing/' + listing.id)">View Listing Details</button>
          </div>

          <!-- Applicants -->
          <div class="applicants">
            <div class="applicants-head">Applicants ({{ listing.applicants.length }})</div>

            <div v-if="listing.applicants.length === 0" class="no-applicants">
              <p class="no-applicants-title">No applicants yet</p>
              <p class="no-applicants-sub">Your listing is live — check back soon!</p>
            </div>

            <div v-else class="applicant-list">
              <div v-for="a in listing.applicants" :key="a.id" class="applicant-row">
                <img v-if="a.profilePic" :src="a.profilePic" class="avatar avatar-img" :alt="a.name" />
                <div v-else class="avatar avatar-fallback">{{ a.name.slice(0,2).toUpperCase() }}</div>
                <div class="applicant-info">
                  <span class="applicant-name" @click="$router.push('/users/' + a.id)">{{ a.name }}</span>
                </div>
                <button class="btn btn-primary btn-sm" @click="openChoose(listing, a)">Choose This Provider</button>
              </div>
            </div>
          </div>
        </article>
      </template>

      <!-- ════ ONGOING TAB ════ -->
      <template v-if="activeTab === 'ongoing'">
        <article v-for="listing in listings.ongoing" :key="listing.id" class="card">
          <div class="card-head">
            <div class="card-info">
              <h3 class="card-title">{{ listing.title }}</h3>
              <div class="card-meta">
                <span class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="#6E6E6E"/></svg>
                  {{ listing.location }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary" @click="$router.push('/listing/' + listing.id)">View Listing Details</button>
          </div>

          <!-- Assigned provider -->
          <div class="applicants">
            <div class="applicants-head">Your Provider</div>
            <div class="applicant-row">
              <img v-if="listing.provider.profilePic" :src="listing.provider.profilePic" class="avatar avatar-img" :alt="listing.provider.name" />
              <div v-else class="avatar avatar-fallback">{{ listing.provider.name.slice(0,2).toUpperCase() }}</div>
              <div class="applicant-info">
                <span class="applicant-name" @click="$router.push('/users/' + listing.provider.id)">
                  {{ listing.provider.name }}
                </span>
              </div>
              <span class="waiting-note">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="#9CA3AF" stroke-width="1.5"/><path d="M8 5v3.5l2 1" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/></svg>
                Waiting for provider to complete
              </span>
            </div>
          </div>

          <div class="card-footer card-footer-right">
            <button class="btn btn-primary" @click="openMarkComplete(listing)">Mark as Completed</button>
          </div>
        </article>
      </template>

      <!-- ════ COMPLETED TAB ════ -->
      <template v-if="activeTab === 'completed'">
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
            <button class="btn btn-secondary" @click="$router.push('/listing/' + listing.id)">View Listing Details</button>
          </div>

          <div class="applicants">
            <div class="applicants-head">Your Provider</div>
            <div class="applicant-row">
              <img v-if="listing.provider.profilePic" :src="listing.provider.profilePic" class="avatar avatar-img" :alt="listing.provider.name" />
              <div v-else class="avatar avatar-fallback">{{ listing.provider.name.slice(0,2).toUpperCase() }}</div>
              <div class="applicant-info">
                <span class="applicant-name" @click="$router.push('/users/' + listing.provider.id)">{{ listing.provider.name }}</span>
              </div>
            </div>
          </div>
        </article>
      </template>

    </div><!-- /content -->

    <!-- Toast notification -->
    <div v-if="toast.show" class="toast">{{ toast.text }}</div>

    <!-- Confirm Modal -->
    <confirmation-modal v-model:showModal="modal.show" :title="modal.title">
      {{ modal.message }}
      <template #buttons>
        <button class="btn cancel-btn modal-btn" :disabled="isConfirming" @click="modal.show = false">
          Cancel
        </button>
        <div class="btn-or-spinner">
          <button
            v-if="!isConfirming"
            :class="['btn', modal.confirmClass, 'modal-btn']"
            @click="handleConfirm"
          >
            {{ modal.confirmLabel }}
          </button>
          <VueSpinner v-else size="30" color="var(--secondary)" aria-label="Processing..." />
        </div>
      </template>
    </confirmation-modal>
  </div>
</template>

<script>
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { VueSpinner } from 'vue3-spinners'
import { db } from '@/firebase.js'
import { collection, query, where, getDocs, getDoc, doc, arrayUnion, writeBatch, onSnapshot } from 'firebase/firestore'
import { getCurrentUser } from '@/auth.js'
import { addCreateNotifToBatch } from '@/utils/notifications'

export default {
  name: 'MyListingsView',
  components: { ConfirmationModal, VueSpinner },

  data() {
    return {
      activeTab: this.$route?.query?.['initial-tab'] || 'awaiting',
      tabs: [
        { key: 'awaiting',  label: 'Awaiting' },
        { key: 'ongoing',   label: 'Ongoing' },
        { key: 'completed', label: 'Completed' },
      ],
      toast: { show: false, text: '' },
      modal: { show: false, icon: '', title: '', message: '', confirmLabel: '', confirmClass: '', _fn: null },
      isConfirming: false,
      loading: false,
      _unsubscribe: null,

      listings: {
        awaiting:  [],
        ongoing:   [],
        completed: [],
      },
    }
  },

  async mounted() {
    const user = await getCurrentUser()
    if (!user) return
    this.loading = true

    const q = query(collection(db, 'listings'), where('lister_id', '==', user.uid))

    this._unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        // Collect all unique UIDs for enrichment
        const allUids = new Set()
        snapshot.forEach(docSnap => {
          const d = docSnap.data()
          ;(d.applicants ?? []).forEach(uid => allUids.add(uid))
          if (d.provider_id) allUids.add(d.provider_id)
        })

        // Fetch user profiles in parallel
        const userProfiles = {}
        await Promise.all([...allUids].map(async uid => {
          try {
            const userSnap = await getDoc(doc(db, 'users', uid))
            if (userSnap.exists()) {
              const u = userSnap.data()
              userProfiles[uid] = {
                id: uid,
                name: u.username ?? 'Unknown',
                profilePic: u.profile_pic_url ?? null,
              }
            }
          } catch (_) {}
        }))

        const awaiting = [], ongoing = [], completed = []
        snapshot.forEach(docSnap => {
          const d = docSnap.data()
          const enrichedApplicants = (d.applicants ?? [])
            .map(uid => ({ ...(userProfiles[uid] ?? { id: uid, name: uid, profilePic: null }), appliedAt: d.applied_at?.[uid]?.toDate() ?? new Date(0) }))
            .sort((a, b) => a.appliedAt - b.appliedAt)
          const providerProfile = d.provider_id ? (userProfiles[d.provider_id] ?? { id: d.provider_id, name: d.provider_id, profilePic: null }) : null

          const listing = {
            id: docSnap.id,
            title: d.title,
            category: d.listing_category,
            location: d.location_text,
            createdAt: d.created_at?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '',
            createdAtRaw: d.created_at?.toDate() ?? new Date(0),
            applicants: enrichedApplicants,
            provider: providerProfile,
            ratingGiven: d.rating_given ?? null,
          }
          const status = (d.status ?? '').trim().toLowerCase()
          if (status === 'ongoing') ongoing.push(listing)
          else if (status === 'completed') completed.push(listing)
          else awaiting.push(listing)
        })

        const byDateDesc = (a, b) => b.createdAtRaw - a.createdAtRaw
        this.listings = {
          awaiting:  awaiting.sort(byDateDesc),
          ongoing:   ongoing.sort(byDateDesc),
          completed: completed.sort(byDateDesc),
        }
      } catch (e) {
        console.error('Failed to load listings:', e)
      } finally {
        this.loading = false
      }
    }, (e) => {
      console.error('Snapshot error:', e)
      this.loading = false
    })
  },

  beforeUnmount() {
    if (this._unsubscribe) this._unsubscribe()
  },

  computed: {
    tabTitle() {
      return { awaiting: 'Awaiting Applicants', ongoing: 'Ongoing Listings', completed: 'Completed Listings' }[this.activeTab]
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
    showToast(text) {
      this.toast = { show: true, text }
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => { this.toast.show = false }, 2200)
    },
    async handleConfirm() {
      this.isConfirming = true
      await this.modal._fn?.()
      this.isConfirming = false
      this.modal.show = false
    },

    openChoose(listing, applicant) {
      this.modal = {
        show: true, icon: '✅',
        title: `Choose ${applicant.name}?`,
        message: 'Once you accept this provider, all other applicants will be automatically rejected. This cannot be undone.',
        confirmLabel: 'Accept Provider', confirmClass: 'btn-primary',
        _fn: async () => {
          try {
            const otherIds = listing.applicants.filter(a => a.id !== applicant.id).map(a => a.id)
            const rejectedAt = {}
            otherIds.forEach(uid => { rejectedAt[uid] = new Date() })

            const updateData = {
              provider_id: applicant.id,
              status: 'Ongoing',
              applicants: [],
            }
            if (otherIds.length > 0) {
              updateData.rejected_applicant_ids = arrayUnion(...otherIds)
              updateData.rejected_at = rejectedAt
            }
            
            const batch = writeBatch(db)
            batch.update(doc(db, 'listings', listing.id), updateData)

            // notify accepted provider
            addCreateNotifToBatch(batch, {
              uid: applicant.id,
              type: 'application_success',
              listing_title: listing.title,
              listing_id: listing.id,
            })

            // notify rejected applicants
            otherIds.forEach(uid => {
              addCreateNotifToBatch(batch, {
                uid,
                type: 'application_fail',
                listing_title: listing.title,
                listing_id: listing.id,
              })
            })

            await batch.commit();
            
            const idx = this.listings.awaiting.findIndex(l => l.id === listing.id)
            if (idx !== -1) {
              const moved = { ...listing, provider: applicant, applicants: [] }
              this.listings.awaiting.splice(idx, 1)
              this.listings.ongoing.unshift(moved)
              this.activeTab = 'ongoing'
            }
            this.showToast(`${applicant.name} accepted as your provider!`)
          } catch (e) {
            console.error('Failed to choose provider:', e)
            this.showToast('Something went wrong. Please try again.')
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
          // Status is written to Firestore only after rating is confirmed in Rating.vue
          this.$router.push({ path: '/rating', query: { listingId: listing.id, providerId: listing.provider?.id } })
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
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--black3);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 22px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13); }

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 14px;
  gap: 16px;
}
.card-info { flex: 1; }
.card-title { font-size: 16px; font-weight: 700; color: #1D1D1D; margin: 4px 0 6px; line-height: 24px; }
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  color: #6E6E6E;
}
.meta-item { display: inline-flex; align-items: center; gap: 4px; }

.card-footer {
  display: flex;
  align-items: center;
  padding: 10px 20px 14px;
  gap: 8px;
}
.card-footer-right { justify-content: flex-end; }

/* ── Applicants / Provider section ── */
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
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.avatar-img {
  object-fit: cover;
}
.avatar-fallback {
  background: #003D7C;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
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

/* ── Category tag color overrides (match Explore solid style) ── */
.tag-education { background: var(--primary)  !important; color: #fff !important; }
.tag-buddy     { background: var(--info)     !important; color: #fff !important; }
.tag-survival  { background: var(--success)  !important; color: #fff !important; }

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
  .applicant-row { flex-wrap: wrap; }
}

.btn-or-spinner {
  width: 15vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: var(--gray4);
  color: var(--white);
}

.cancel-btn:hover {
  background-color: var(--gray5);
}

.modal-btn {
  padding: 0.75rem 0;
  width: 15vw;
  width: 15vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn:disabled {
  background-color: var(--gray5);
  border: var(--gray5);
  color: var(--white);
  cursor: not-allowed;
}
</style>

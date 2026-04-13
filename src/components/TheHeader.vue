<template>
    <header class="header">
        <div class="header-content">
            <!-- logotype -->
            <router-link to="/" class="header-logo" title="Go to Explore" aria-label="Go to Explore">
                <img src="@/assets/logotype.png" alt="NUSOS Logotype" 
                    class="logo-image"/>
            </router-link>

            <!-- hidden below 860px width -->
            <div class="header-nav-and-profile">
                <!-- navigation items -->
                <nav class="header-nav">
                    <router-link v-for="item in navItems" :key="item.name" 
                        :to="item.path" class="nav-item" active-class="active">
                        {{ item.name }}
                    </router-link>
                </nav>

                <!-- profile page nav -->
                <router-link to="/my-profile" class="header-profile" title="Go to Your Profile" aria-label="Go to Your Profile">
                    <img :src="picUrl" :alt="profilePicAltText" 
                        class="profile-pic"/>
                </router-link>
            </div>

            <!-- hidden above 860px width -->
            <div class="menu-container">
            <DropdownMenuRoot>
                <DropdownMenuTrigger as-child>
                    <button class="menu-button" title="Open navigation menu" aria-label="Open navigation menu">
                        <MenuIcon :size="28" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent class="menu-content">
                    <DropdownMenuItem v-for="item in menuItems" :key="item.name" as-child>
                        <router-link :to="item.path" class="menu-item" 
                            :class="{ active: isActive(item.path)}">
                                {{ item.name }}
                        </router-link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuRoot>
            </div>  
        </div>
        <transition name="fade" mode="out-in">
            <Notification v-if="currNotif" :key="currNotif.timestamp.seconds":notif="currNotif" @closeNotif="closeNotif" />
        </transition>
    </header>
</template>

<script> 
import defaultProfilePic from '@/assets/default-profile-pic.png';
import { Menu as MenuIcon } from 'lucide-vue-next';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuRoot, DropdownMenuTrigger } from 'radix-vue';
import Notification from './Notification.vue';
import { assignMonthlyRewardsIfNeeded } from '@/utils/assignReward';
import { getMsToSgtNextMonth } from '@/utils/formatSgtTime';
import { addResetPointNotifs } from '@/utils/notifications';
import { getCurrentUser } from '@/auth';
import { db } from '@/firebase';
import { collection, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { mergeApplicantNotifs, mergeApplicationStatusNotifs, mergeReceiveRewardNotifs, mergePointsChangeNotifs } from '@/utils/notifications';

export default {
    name: 'TheHeader',

    props: {
        profilePicUrl: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            navItems: [
                { name: 'Explore', path: '/' },
                { name: 'Add Listing', path: '/add-listing' },
                { name: 'My Listings', path: '/my-listings' },
                { name: 'My Gigs', path: '/my-gigs' },
                { name: 'Leaderboard', path: '/leaderboard' },
            ],
            refreshTimer: null,
            receiveApplicantNotif: null,
            applicationSuccessNotif: null,
            applicationFailNotif: null,
            receiveRewardNotif: null,
            pointsChangeNotif: null,
            currNotif: null,
            isShowingNotif: false,
            notifTimer: null,
            unsubscribeNotifsListener: null,
            transitionTimer: null,
        }
    },

    computed: {
        picUrl() {
            return this.profilePicUrl || defaultProfilePic;
        }, 

        profilePicAltText() {
            return this.profilePicUrl ? 'Your Profile Picture' : 'Default Profile Picture';
        },

        menuItems() {
            return [
                { name: 'My Profile', path: '/my-profile' },
                ...this.navItems
            ];
        }
    },

    components: {
        DropdownMenuRoot,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
        MenuIcon,
        Notification,
    },

    async mounted() {
        await assignMonthlyRewardsIfNeeded();
        await addResetPointNotifs();
        this.scheduleMonthlyRefresh();
        await this.startNotifsListener();
    },

    beforeUnmount() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        if (this.notifTimer) {
            clearTimeout(this.notifTimer);
        }
        if (this.unsubscribeNotifsListener) {
            this.unsubscribeNotifsListener();
        }

        if (this.transitionTimer) {
            clearTimeout(this.transitionTimer);
        }
    },

    methods: {
        isActive(path) {
            return this.$route.path === path || 
                this.$route.path.startsWith(path + '/');
        },

        scheduleMonthlyRefresh() {
            const msUntilNextMonth = getMsToSgtNextMonth();
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
            }
            this.refreshTimer = setTimeout(async () => {
                await assignMonthlyRewardsIfNeeded();
                await addResetPointNotifs();
                this.scheduleMonthlyRefresh(); // reschedule for the following month
            }, msUntilNextMonth);
        },

        async startNotifsListener() {
            const currentUser = await getCurrentUser();
            if (!currentUser) return;
            const uid = currentUser.uid;
            const q = query(collection(db, 'notifications'), where('uid', '==', uid), where('is_sent', '==', false));

            this.unsubscribeNotifsListener = onSnapshot(q, (snapshot) => {
                const newNotifs = [];
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        newNotifs.push({ id: change.doc.id, ref: change.doc.ref, ...change.doc.data() });
                    }
                });
                if (newNotifs.length > 0) {
                    const newReceiveApplicantNotifs = newNotifs.filter(n => n.type === 'receive_applicant');
                    const newApplicationSuccessNotifs = newNotifs.filter(n => n.type === 'application_success');
                    const newApplicationFailNotifs = newNotifs.filter(n => n.type === 'application_fail');
                    const newReceiveRewardNotifs = newNotifs.filter(n => n.type === 'receive_reward');
                    const newPointsChangeNotifs = newNotifs.filter(n => n.type === 'receive_rating' || n.type === 'points_reset');
                    this.receiveApplicantNotif = newReceiveApplicantNotifs.length 
                        ? mergeApplicantNotifs(this.receiveApplicantNotif, newReceiveApplicantNotifs) 
                        : this.receiveApplicantNotif;
                    this.applicationSuccessNotif = newApplicationSuccessNotifs.length 
                        ? mergeApplicationStatusNotifs(this.applicationSuccessNotif, newApplicationSuccessNotifs, 'application_success') 
                        : this.applicationSuccessNotif;
                    this.applicationFailNotif = newApplicationFailNotifs.length 
                        ? mergeApplicationStatusNotifs(this.applicationFailNotif, newApplicationFailNotifs, 'application_fail') 
                        : this.applicationFailNotif;
                    this.receiveRewardNotif = newReceiveRewardNotifs.length 
                        ? mergeReceiveRewardNotifs(this.receiveRewardNotif, newReceiveRewardNotifs) 
                        : this.receiveRewardNotif;
                    this.pointsChangeNotif = newPointsChangeNotifs.length 
                        ? mergePointsChangeNotifs(this.pointsChangeNotif, newPointsChangeNotifs) 
                        : this.pointsChangeNotif;                  
                    if (!this.isShowingNotif) {
                        this.showNextNotif();
                    }
                    // do nothing if there is a notif currently being shown, show next notif will be triggered automatically
                }
            });
        },

        showNextNotif() {
            clearTimeout(this.notifTimer);

            const candidateNotifs = [
                this.receiveApplicantNotif, 
                this.applicationSuccessNotif, 
                this.applicationFailNotif, 
                this.receiveRewardNotif, 
                this.pointsChangeNotif
            ].filter(n => n != null); // filter out nulls

            if (candidateNotifs.length === 0) {
                this.currNotif = null;
                return;
            }

            // pick earliest notif
            this.currNotif = candidateNotifs.reduce((earliest, notif) => {
                return notif.timestamp.seconds < earliest.timestamp.seconds ? notif : earliest;
            });
            if (this.currNotif.type === 'receive_applicant') {
                this.receiveApplicantNotif = null;
            } else if (this.currNotif.type === 'application_success') {
                this.applicationSuccessNotif = null;
            } else if (this.currNotif.type === 'application_fail') {
                this.applicationFailNotif = null;
            } else if (this.currNotif.type === 'receive_reward') {
                this.receiveRewardNotif = null;
            } else if (this.currNotif.type === 'points_change') {
                this.pointsChangeNotif = null;
            }
            this.isShowingNotif = true;
            this.notifTimer = setTimeout(() => {
                this.closeNotif()
            }, 15000); // show each notif for 15 seconds if not dismissed
        },

        async closeNotif() {
            if (this.currNotif?.refs) {
                for (const ref of this.currNotif.refs) {
                    updateDoc(ref, { is_sent: true }).catch(console.error);
                }
            }
            this.currNotif = null;
            this.isShowingNotif = false;
            clearTimeout(this.notifTimer);
            clearTimeout(this.transitionTimer);
            this.transitionTimer = setTimeout(() => {
                this.showNextNotif()
            }, 150); // add slight delay before showing next notif to allow fade out transition
        },   
    },
 
}
</script>

<style scoped>
.header {
    width: 100%;
    position: fixed;
    inset: 0;
    height: 4.5rem;
    padding-top: 0.5rem;
    background-color: #fff;
    z-index: 999;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem max(2rem, 7vw) 0.5rem max(2rem, 7vw);
    background-color: #fff;
    z-index: 999;
}

.logo-image {
    height: 3.5rem;
    width: auto;
}

.header-nav-and-profile {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-item {
    font-size: 1rem;
    color: #000;
    padding: 0.5rem 1rem;
    margin: 0.25rem;
    text-decoration: none;
}

.nav-item.active, .menu-button.open {
    font-weight: bold;
    background-color: #CCD8E5;
}

.nav-item.active, .menu-button.open {
    border: 0.0625rem solid #002B57;
    border-radius: 0.5rem;
}

.nav-item:hover, .menu-button:hover {
    font-weight: bold;
    background-color: #99B1CB;
    border: 0.0625rem solid #4D77A3;
    border-radius: var(--radius);
}

.profile-pic {
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    border: 2px solid var(--gray5);
}

.menu-container {
    position: relative;
    flex-shrink: 0;
}

.menu-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 2.75rem;
    height: 2.75rem;
}

.menu-button svg {
    margin: auto;
    vertical-align: middle;
}

@media (min-width: 912px) {
    .menu-container {
        display: none;
    }
}

@media (max-width: 912px) {
    .header-nav-and-profile {
        display: none;
    }
}
</style>

<style>
.menu-content {
    margin-top: 0.25rem;
    margin-right: max(2rem, 7vw);
    background-color: #fff;
    border: 1px solid #8C8C8C;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
    outline: none;
}

.menu-item {
    display: block;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    color: #000;
    text-decoration: none;
    text-align: center;
}

.menu-item.active {
    font-weight: bold;
    background-color: #CCD8E5;
}

.menu-item[data-highlighted] {
    font-weight: bold;
    background-color: #99B1CB;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

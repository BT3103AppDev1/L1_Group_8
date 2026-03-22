import { auth } from './firebase.js';

// auth.authStateReady() waits for Firebase to finish loading persisted auth state,
// then resolves immediately on every subsequent call — much faster than creating
// a new onAuthStateChanged listener each time.
async function getCurrentUser() {
  await auth.authStateReady();
  return auth.currentUser;
}

export { getCurrentUser };

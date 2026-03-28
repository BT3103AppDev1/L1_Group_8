import { auth } from './firebase.js';

let currentUser = auth.currentUser;
const listeners = [];

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  listeners.forEach(listener => listener(user));
});

async function getCurrentUser() {
  await auth.authStateReady();
  return currentUser;
}

function onAuthUserChanged(callback) {
  listeners.push(callback);
  callback(currentUser); 
}

export { getCurrentUser, onAuthUserChanged };

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';

let currentUser = auth.currentUser;
const listeners = [];

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  listeners.forEach(listener => listener(user));
});

function getCurrentUser() {
  return currentUser;
}

function onAuthUserChanged(callback) {
  listeners.push(callback);
  callback(currentUser); 
}

export { getCurrentUser, onAuthUserChanged };
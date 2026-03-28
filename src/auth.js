import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';

// TODO: remove hardcode when auth is live
let currentUser = { uid: 'zrxX7Bt3kZSaPYpyBuaokbJz47i1' };
const listeners = [];

/* actual logic
let currentUser = auth.currentUser;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  listeners.forEach(listener => listener(user));
});
*/

function getCurrentUser() {
  return currentUser;
}

function onAuthUserChanged(callback) {
  listeners.push(callback);
  callback(currentUser); 
}

export { getCurrentUser, onAuthUserChanged };
import { auth } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";

// TODO: remove hardcode when auth is live
//let currentUser = { uid: 'zrxX7Bt3kZSaPYpyBuaokbJz47i1' }; 
const listeners = [];

let currentUser = auth.currentUser;
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

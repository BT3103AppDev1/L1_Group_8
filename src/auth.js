import { auth } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";

<<<<<<< HEAD
// TODO: remove hardcode when auth is live
//let currentUser = { uid: 'zrxX7Bt3kZSaPYpyBuaokbJz47i1' }; 
const listeners = [];

let currentUser = auth.currentUser;
=======
let currentUser = auth.currentUser;
const listeners = [];

>>>>>>> edc99cad9c16ef02dfdf805bb5d30346722751d6
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  listeners.forEach(listener => listener(user));
});
<<<<<<< HEAD

=======
>>>>>>> edc99cad9c16ef02dfdf805bb5d30346722751d6

async function getCurrentUser() {
  await auth.authStateReady();
  return currentUser;
}

function onAuthUserChanged(callback) {
  listeners.push(callback);
  callback(currentUser);
}
export { getCurrentUser, onAuthUserChanged };

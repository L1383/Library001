
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmZeIOUi-M52OG0eiy5bPFHNydAoqv8hg",
  authDomain: "library-fbfe6.firebaseapp.com",
  projectId: "library-fbfe6",
  storageBucket: "library-fbfe6.appspot.com",
  messagingSenderId: "446025119683",
  appId: "1:446025119683:web:9b4db2c4af306c12a66f76",
  measurementId: "G-X13WFMTPMZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

window.signUp = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("ثبت‌نام موفق"))
    .catch(err => alert("خطا: " + err.message));
}

window.signIn = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("ورود موفق"))
    .catch(err => alert("خطا: " + err.message));
}

window.signOut = function () {
  signOut(auth).then(() => alert("خروج موفق"));
}

onAuthStateChanged(auth, user => {
  document.getElementById("mainApp").style.display = user ? "block" : "none";
});

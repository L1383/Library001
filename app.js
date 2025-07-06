
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const email = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');

const addNovelBtn = document.getElementById('addNovelBtn');
const novelInput = document.getElementById('novelInput');
const genreInput = document.getElementById('genreInput');
const linksContainer = document.getElementById('linksContainer');
const addLinkBtn = document.getElementById('addLinkBtn');
const novelList = document.getElementById('novelList');

loginBtn.onclick = () => signInWithEmailAndPassword(auth, email.value, password.value);
signupBtn.onclick = () => createUserWithEmailAndPassword(auth, email.value, password.value);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    authSection.style.display = 'none';
    mainSection.style.display = 'block';
    loadNovels(user.uid);
  } else {
    authSection.style.display = 'block';
    mainSection.style.display = 'none';
  }
});

addLinkBtn.onclick = () => {
  const input = document.createElement('input');
  input.type = 'url';
  input.className = 'linkInput';
  input.placeholder = 'لینک مرجع';
  linksContainer.appendChild(input);
};

addNovelBtn.onclick = async () => {
  const name = novelInput.value.trim();
  const genres = Array.from(genreInput.selectedOptions).map(opt => opt.value);
  const links = Array.from(document.querySelectorAll('.linkInput')).map(input => input.value).filter(Boolean);
  const user = auth.currentUser;

  if (user && name && genres.length) {
    await addDoc(collection(db, 'novels'), {
      uid: user.uid,
      name,
      genres,
      links,
      created: new Date()
    });
    novelInput.value = '';
    document.querySelectorAll('.linkInput').forEach((input, idx) => idx === 0 ? input.value = '' : input.remove());
    loadNovels(user.uid);
  }
};

async function loadNovels(uid) {
  novelList.innerHTML = '';
  const q = query(collection(db, 'novels'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.className = 'novel-item';
    div.innerHTML = `<strong>${data.name}</strong><br>ژانر: ${data.genres.join(', ')}<br>${data.links.map(l => `<a href="${l}" target="_blank">🔗</a>`).join(' ')}`;
    novelList.appendChild(div);
  });
}

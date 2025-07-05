import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const addBtn = document.getElementById("addNovel");
const appDiv = document.getElementById("app");
const novelList = document.getElementById("novels");
const searchBox = document.getElementById("searchBox");

const nameInput = document.getElementById("novelName");
const catInput = document.getElementById("novelCategory");
const chaptersInput = document.getElementById("chapters");
const readInput = document.getElementById("chaptersRead");
const ratingInput = document.getElementById("rating");
const linkInput = document.getElementById("link");
const favInput = document.getElementById("favorite");
const completeInput = document.getElementById("completed");

signupBtn.onclick = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("ثبت‌نام موفق"))
    .catch(err => alert("خطا: " + err.message));
};

loginBtn.onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("ورود موفق"))
    .catch(err => alert("خطا: " + err.message));
};

logoutBtn.onclick = () => {
  signOut(auth).then(() => alert("خروج انجام شد"));
};

onAuthStateChanged(auth, async user => {
  if (user) {
    appDiv.style.display = "block";
    loadNovels(user.uid);
    addBtn.onclick = async () => {
      const name = nameInput.value.trim();
      const category = catInput.value;
      const chapters = parseInt(chaptersInput.value);
      const chaptersRead = parseInt(readInput.value);
      const rating = parseFloat(ratingInput.value);
      const link = linkInput.value.trim();
      const favorite = favInput.checked;
      const completed = completeInput.checked;

      if (!name) return alert("نام رمان الزامی است");

      await addDoc(collection(db, "novels"), {
        uid: user.uid, name, category, chapters, chaptersRead,
        rating, link, favorite, completed
      });

      nameInput.value = "";
      chaptersInput.value = "";
      readInput.value = "";
      ratingInput.value = "";
      linkInput.value = "";
      favInput.checked = false;
      completeInput.checked = false;

      loadNovels(user.uid);
    };

    searchBox.oninput = () => loadNovels(user.uid, searchBox.value.toLowerCase());
  } else {
    appDiv.style.display = "none";
    novelList.innerHTML = "";
  }
});

async function loadNovels(uid, search = "") {
  novelList.innerHTML = "در حال بارگذاری...";
  const q = query(collection(db, "novels"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  novelList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (search && !data.name.toLowerCase().includes(search)) return;
    const div = document.createElement("div");
    div.className = "novel-item";
    div.innerHTML = `
      <strong>${data.name}</strong> ${data.favorite ? '⭐' : ''} ${data.completed ? '✔️' : ''}<br>
      دسته: ${data.category} | ${data.chaptersRead || 0} / ${data.chapters || '?'}<br>
      ${data.rating ? `امتیاز: ${data.rating}/10<br>` : ""}
      ${data.link ? `<a href="${data.link}" target="_blank">🌐 لینک</a><br>` : ""}
      <button onclick="editNovel('${docSnap.id}')">✏️ ویرایش</button>
      <button onclick="deleteNovel('${docSnap.id}')">🗑️ حذف</button>
    `;
    novelList.appendChild(div);
  });
}

window.editNovel = async function(id) {
  const ref = doc(db, "novels", id);
  const name = prompt("نام جدید:");
  const rating = parseFloat(prompt("امتیاز (از 10):"));
  await updateDoc(ref, { name, rating });
  loadNovels(auth.currentUser.uid);
};

window.deleteNovel = async function(id) {
  const ok = confirm("حذف شود؟");
  if (!ok) return;
  await deleteDoc(doc(db, "novels", id));
  loadNovels(auth.currentUser.uid);
};

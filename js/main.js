import { db } from "./firebase.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const damRef = ref(db, "dams");

window.addDam = () => {
  const name = damName.value;
  const date = damDate.value;
  if (!name) return alert("Nhập tên đám");

  push(damRef, { name, date });
};

onValue(damRef, snap => {
  damList.innerHTML = "";
  const keyword = searchDam.value?.toLowerCase() || "";

  snap.forEach(d => {
    if (!d.val().name.toLowerCase().includes(keyword)) return;

    damList.innerHTML += `
      <div class="item">
        <a href="dam.html?id=${d.key}">${d.val().name}</a>
      </div>`;
  });
});

searchDam.oninput = () => onValue(damRef, () => {});

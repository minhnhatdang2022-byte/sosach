import { db } from "./firebase.js";
import { ref, push, onValue, remove } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const damRef = ref(db, "dams");
let cache = {};

window.addDam = () => {
  const name = damName.value.trim();
  if (!name) return alert("Nhập tên đám");
  push(damRef, { name });
  damName.value = "";
};

window.render = () => {
  const keyword = searchDam.value.toLowerCase();
  list.innerHTML = "";

  Object.entries(cache).forEach(([id, dam]) => {
    if (!dam.name.toLowerCase().includes(keyword)) return;

    list.innerHTML += `
      <div class="item">
        <b>${dam.name}</b><br>
        <button onclick="openDam('${id}')">Mở</button>
        <button onclick="deleteDam('${id}')">Xóa</button>
      </div>`;
  });
};

window.openDam = id => {
  location.href = `dam.html?id=${id}`;
};

window.deleteDam = id => {
  if (confirm("Xóa đám này?"))
    remove(ref(db, "dams/" + id));
};

onValue(damRef, snap => {
  cache = snap.val() || {};
  render();
});

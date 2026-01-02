import { db } from "./firebase.js";
import { ref, push, onValue, remove } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const damRef = ref(db, "dams");

window.addDam = () => {
  const name = damName.value.trim();
  if (!name) return alert("Nhập tên đám");
  push(damRef, { name });
  damName.value = "";
};

onValue(damRef, snap => {
  damList.innerHTML = "";
  snap.forEach(c => {
    const id = c.key;
    const { name } = c.val();
    damList.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>
          <a href="dam.html?id=${id}">➡️ Mở</a>
          <button class="action-btn" onclick="delDam('${id}')">❌</button>
        </td>
      </tr>`;
  });
});

window.delDam = id => {
  if (confirm("Xoá đám này?"))
    remove(ref(db, "dams/" + id));
};

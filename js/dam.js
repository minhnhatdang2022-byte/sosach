import { db } from "./firebase.js";
import { ref, push, onValue, update, remove } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const id = new URLSearchParams(location.search).get("id");
const giftRef = ref(db, `dams/${id}/gifts`);

window.addGift = () => {
  if (!name.value || !money.value) return;
  push(giftRef, {
    name: name.value,
    money: Number(money.value)
  });
  name.value = money.value = "";
};

onValue(giftRef, snap => {
  let sum = 0;
  giftList.innerHTML = "";
  snap.forEach(c => {
    const d = c.val();
    sum += d.money;
    giftList.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.money.toLocaleString()}</td>
        <td>
          <button onclick="delGift('${c.key}')">❌</button>
        </td>
      </tr>`;
  });
  total.innerText = "Tổng tiền: " + sum.toLocaleString() + " đ";
});

window.delGift = key => {
  if (confirm("Xoá người này?"))
    remove(ref(db, `dams/${id}/gifts/${key}`));
};

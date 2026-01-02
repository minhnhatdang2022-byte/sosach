import { db } from "./firebase.js";
import { ref, push, onValue } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const id = new URLSearchParams(location.search).get("id");
const damRef = ref(db, `dams/${id}`);

const guestRef = ref(db, `dams/${id}/guests`);
const costRef = ref(db, `dams/${id}/costs`);

window.addGuest = () => {
  push(guestRef, {
    name: guestName.value,
    money: Number(guestMoney.value)
  });
};

window.addCost = () => {
  push(costRef, {
    name: costName.value,
    money: Number(costMoney.value)
  });
};

let totalGuest = 0;
let totalCostVal = 0;

onValue(damRef, s => {
  damTitle.innerText = s.val().name;
});

onValue(guestRef, s => {
  guestList.innerHTML = "";
  totalGuest = 0;
  const key = searchGuest.value?.toLowerCase() || "";

  s.forEach(g => {
    if (!g.val().name.toLowerCase().includes(key)) return;
    totalGuest += g.val().money;
    guestList.innerHTML += `<div>${g.val().name}: ${g.val().money}</div>`;
  });
  totalMoney.innerText = "Tổng tiền mừng: " + totalGuest;
  updateProfit();
});

onValue(costRef, s => {
  costList.innerHTML = "";
  totalCostVal = 0;

  s.forEach(c => {
    totalCostVal += c.val().money;
    costList.innerHTML += `<div>${c.val().name}: ${c.val().money}</div>`;
  });
  totalCost.innerText = "Tổng chi phí: " + totalCostVal;
  updateProfit();
});

searchGuest.oninput = () => onValue(guestRef, () => {});

function updateProfit() {
  profit.innerText = "Lãi / Lỗ: " + (totalGuest - totalCostVal);
}

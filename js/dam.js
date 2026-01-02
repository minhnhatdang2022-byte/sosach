import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const id = new URLSearchParams(location.search).get("id");
const damRef = ref(db, "dams/" + id);

let gifts = {}, costs = {};

window.back = () => history.back();

onValue(damRef, snap => {
  const d = snap.val();
  title.innerText = d.name;
  gifts = d.gifts || {};
  costs = d.costs || {};
  render();
});

window.addGift = () => {
  if (!name.value || !money.value) return;
  push(ref(db, `dams/${id}/gifts`), {
    name: name.value,
    money: Number(money.value)
  });
  name.value = money.value = "";
};

window.addCost = () => {
  if (!costName.value || !costMoney.value) return;
  push(ref(db, `dams/${id}/costs`), {
    name: costName.value,
    money: Number(costMoney.value)
  });
  costName.value = costMoney.value = "";
};

window.del = path => {
  if (confirm("Xóa?")) remove(ref(db, path));
};

window.edit = (path, field, value) => {
  update(ref(db, path), { [field]: value });
};

window.render = () => {
  const k = searchName.value.toLowerCase();
  let tg = 0, tc = 0;

  giftList.innerHTML = "";
  Object.entries(gifts).forEach(([i, g]) => {
    if (!g.name.toLowerCase().includes(k)) return;
    tg += g.money;
    giftList.innerHTML += `
      <div class="item">
        ${g.name} - ${g.money}
        <button onclick="del('dams/${id}/gifts/${i}')">X</button>
      </div>`;
  });

  costList.innerHTML = "";
  Object.entries(costs).forEach(([i, c]) => {
    tc += c.money;
    costList.innerHTML += `
      <div class="item">
        ${c.name} - ${c.money}
        <button onclick="del('dams/${id}/costs/${i}')">X</button>
      </div>`;
  });

  totalGift.innerText = tg;
  totalCost.innerText = tc;
  profit.innerText = tg - tc;
};

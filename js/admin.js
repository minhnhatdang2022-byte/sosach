// js/admin.js
import { database, formatMoney, calculateTotal } from './firebase.js';
import { checkAuth, logout } from './auth-check.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

let currentUser = null;

// Khởi tạo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Kiểm tra đăng nhập VÀ phải là admin
    currentUser = await checkAuth(true);
    
    // Load danh sách user
    loadAllUsers();
    
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Auth error:', error);
  }
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Load tất cả users và dữ liệu của họ
function loadAllUsers() {
  const usersRef = ref(database, 'users');
  const damsRef = ref(database, 'dams');
  
  let usersData = {};
  let damsData = {};
  
  // Load users
  onValue(usersRef, (snapshot) => {
    usersData = snapshot.val() || {};
    renderUsers(usersData, damsData);
  });
  
  // Load dams
  onValue(damsRef, (snapshot) => {
    damsData = snapshot.val() || {};
    renderUsers(usersData, damsData);
  });
}

// Render danh sách users
function renderUsers(usersData, damsData) {
  const userList = document.getElementById('userList');
  
  if (Object.keys(usersData).length === 0) {
    userList.innerHTML = `
      <div class="empty-state">
        <p>Chưa có người dùng nào</p>
      </div>
    `;
    return;
  }
  
  userList.innerHTML = '';
  
  Object.entries(usersData).forEach(([userId, userData]) => {
    const userCard = createUserCard(userId, userData, damsData[userId] || {});
    userList.appendChild(userCard);
  });
}

// Tạo card cho mỗi user
function createUserCard(userId, userData, userDams) {
  const div = document.createElement('div');
  div.className = 'user-card';
  
  // Tính tổng cho tất cả đám của user
  let totalTienMung = 0;
  let totalChiPhi = 0;
  let damCount = Object.keys(userDams).length;
  
  Object.values(userDams).forEach(dam => {
    totalTienMung += calculateTotal(dam.tienMung);
    totalChiPhi += calculateTotal(dam.chiPhi);
  });
  
  const laiLo = totalTienMung - totalChiPhi;
  
  div.innerHTML = `
    <h3>👤 ${userData.name || 'Chưa có tên'}</h3>
    <div class="user-info">
      <p>📧 Email: <span>${userData.email}</span></p>
      <p>🎉 Số đám: <span>${damCount}</span></p>
      <p>💰 Tổng tiền thu: <span class="money positive">${formatMoney(totalTienMung)}</span></p>
      <p>💸 Tổng chi phí: <span class="money">${formatMoney(totalChiPhi)}</span></p>
      <p>📊 Lãi/Lỗ: <span class="money ${laiLo >= 0 ? 'positive' : 'negative'}">${laiLo >= 0 ? '+' : ''}${formatMoney(laiLo)}</span></p>
    </div>
    <div id="dams-${userId}"></div>
  `;
  
  // Render danh sách đám của user
  const damsContainer = div.querySelector(`#dams-${userId}`);
  
  if (damCount === 0) {
    damsContainer.innerHTML = '<p style="color: #999; font-style: italic;">Chưa có đám nào</p>';
  } else {
    Object.entries(userDams).forEach(([damId, damData]) => {
      const damItem = createDamItem(damData);
      damsContainer.appendChild(damItem);
    });
  }
  
  return div;
}

// Tạo item cho mỗi đám
function createDamItem(damData) {
  const div = document.createElement('div');
  div.className = 'dam-item';
  
  const totalTienMung = calculateTotal(damData.tienMung);
  const totalChiPhi = calculateTotal(damData.chiPhi);
  const laiLo = totalTienMung - totalChiPhi;
  
  div.innerHTML = `
    <strong>🎊 ${damData.name || 'Chưa đặt tên'}</strong>
    <div class="dam-summary">
      <span>Thu: <span class="money positive">${formatMoney(totalTienMung)}</span></span>
      <span>Chi: <span class="money">${formatMoney(totalChiPhi)}</span></span>
      <span>Lãi/Lỗ: <span class="money ${laiLo >= 0 ? 'positive' : 'negative'}">${laiLo >= 0 ? '+' : ''}${formatMoney(laiLo)}</span></span>
    </div>
  `;
  
  return div;
}

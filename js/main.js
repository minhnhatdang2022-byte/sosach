// js/main.js
import { database, isAdmin, formatMoney, calculateTotal } from './firebase.js';
import { checkAuth, logout } from './auth-check.js';
import { ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Biến lưu trữ
let currentUser = null;
let allDams = {};

// Khởi tạo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Kiểm tra đăng nhập
    currentUser = await checkAuth();
    
    // Hiển thị tên user
    loadUserInfo();
    
    // Load danh sách đám
    loadDams();
    
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Auth error:', error);
  }
});

// Load thông tin user
function loadUserInfo() {
  const userNameEl = document.getElementById('userName');
  userNameEl.textContent = currentUser.email;
  
  // Hiển thị nút admin nếu là admin
  if (isAdmin(currentUser.email)) {
    document.getElementById('adminBtn').style.display = 'inline-block';
  }
}

// Thiết lập event listeners
function setupEventListeners() {
  // Nút đăng xuất
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Nút admin
  document.getElementById('adminBtn').addEventListener('click', () => {
    window.location.href = 'admin.html';
  });
  
  // Nút thêm đám
  document.getElementById('addDamBtn').addEventListener('click', addNewDam);
  
  // Tìm kiếm
  document.getElementById('searchInput').addEventListener('input', filterDams);
}

// Load danh sách đám của user hiện tại
function loadDams() {
  const damsRef = ref(database, `dams/${currentUser.uid}`);
  
  onValue(damsRef, (snapshot) => {
    const data = snapshot.val();
    allDams = data || {};
    displayDams(allDams);
  });
}

// Hiển thị danh sách đám
function displayDams(dams) {
  const damList = document.getElementById('damList');
  
  if (Object.keys(dams).length === 0) {
    damList.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <p>Chưa có đám nào</p>
          <p style="font-size: 0.9em; color: #999;">Nhấn "Thêm Đám Mới" để bắt đầu</p>
        </td>
      </tr>
    `;
    return;
  }

  damList.innerHTML = '';
  
  // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
  const sortedEntries = Object.entries(dams).sort((a, b) => {
    return (b[1].createdAt || 0) - (a[1].createdAt || 0);
  });
  
  sortedEntries.forEach(([damId, damData]) => {
    const row = createDamRow(damId, damData);
    damList.appendChild(row);
  });
}

// Tạo một hàng trong bảng đám
function createDamRow(damId, damData) {
  const tr = document.createElement('tr');
  tr.className = 'clickable-row';
  
  // Tính toán tổng tiền
  const totalTienMung = calculateTotal(damData.tienMung);
  const totalChiPhi = calculateTotal(damData.chiPhi);
  const laiLo = totalTienMung - totalChiPhi;
  
  tr.innerHTML = `
    <td>${damData.name || 'Chưa đặt tên'}</td>
    <td class="money positive">${formatMoney(totalTienMung)}</td>
    <td class="money">${formatMoney(totalChiPhi)}</td>
    <td class="money ${laiLo >= 0 ? 'positive' : 'negative'}">
      ${laiLo >= 0 ? '+' : ''}${formatMoney(laiLo)}
    </td>
    <td class="action-buttons">
      <button class="btn btn-warning btn-small" data-id="${damId}">✏️ Sửa</button>
      <button class="btn btn-danger btn-small" data-id="${damId}">🗑️ Xóa</button>
    </td>
  `;
  
  // Event cho nút sửa
  tr.querySelector('.btn-warning').addEventListener('click', (e) => {
    e.stopPropagation();
    editDam(e.target.dataset.id);
  });
  
  // Event cho nút xóa
  tr.querySelector('.btn-danger').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteDam(e.target.dataset.id);
  });
  
  // Click vào hàng để mở chi tiết
  tr.addEventListener('click', () => {
    window.location.href = `dam.html?id=${damId}`;
  });
  
  return tr;
}

// Thêm đám mới
function addNewDam() {
  const damName = prompt('Nhập tên đám:');
  
  if (!damName || damName.trim() === '') {
    alert('Vui lòng nhập tên đám!');
    return;
  }
  
  const damsRef = ref(database, `dams/${currentUser.uid}`);
  const newDamRef = push(damsRef);
  
  set(newDamRef, {
    name: damName.trim(),
    createdAt: Date.now(),
    tienMung: {},
    chiPhi: {}
  }).then(() => {
    alert('Thêm đám thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Sửa tên đám
function editDam(damId) {
  const currentName = allDams[damId].name;
  const newName = prompt('Nhập tên mới:', currentName);
  
  if (!newName || newName.trim() === '') {
    return;
  }
  
  const damRef = ref(database, `dams/${currentUser.uid}/${damId}`);
  update(damRef, {
    name: newName.trim()
  }).then(() => {
    alert('Cập nhật thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Xóa đám
function deleteDam(damId) {
  const damName = allDams[damId].name;
  
  if (!confirm(`Bạn có chắc muốn xóa đám "${damName}"?\nTất cả dữ liệu sẽ bị xóa!`)) {
    return;
  }
  
  const damRef = ref(database, `dams/${currentUser.uid}/${damId}`);
  remove(damRef).then(() => {
    alert('Đã xóa đám!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Lọc đám theo từ khóa tìm kiếm
function filterDams() {
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  
  if (searchText === '') {
    displayDams(allDams);
    return;
  }
  
  const filtered = {};
  
  Object.entries(allDams).forEach(([damId, damData]) => {
    if (damData.name && damData.name.toLowerCase().includes(searchText)) {
      filtered[damId] = damData;
    }
  });
  
  displayDams(filtered);
}

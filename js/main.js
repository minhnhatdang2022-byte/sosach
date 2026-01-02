// js/main.js
import { database } from './firebase.js';
import { ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Biến lưu trữ dữ liệu
let allDams = {};

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
  loadDams();
  setupEventListeners();
});

// Thiết lập các event listeners
function setupEventListeners() {
  // Nút thêm đám
  document.getElementById('addDamBtn').addEventListener('click', addNewDam);
  
  // Tìm kiếm
  document.getElementById('searchInput').addEventListener('input', filterDams);
}

// Load danh sách đám từ Firebase
function loadDams() {
  const damsRef = ref(database, 'dams');
  
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
  
  Object.entries(dams).forEach(([damId, damData]) => {
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
      <button class="btn btn-warning btn-small" onclick="editDam('${damId}')">✏️ Sửa</button>
      <button class="btn btn-danger btn-small" onclick="deleteDam('${damId}')">🗑️ Xóa</button>
    </td>
  `;
  
  // Click vào hàng để mở chi tiết (trừ nút)
  tr.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn')) {
      window.location.href = `dam.html?id=${damId}`;
    }
  });
  
  return tr;
}

// Tính tổng tiền từ object
function calculateTotal(dataObj) {
  if (!dataObj) return 0;
  return Object.values(dataObj).reduce((sum, item) => sum + (item.amount || 0), 0);
}

// Format tiền VND
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Thêm đám mới
function addNewDam() {
  const damName = prompt('Nhập tên đám:');
  
  if (!damName || damName.trim() === '') {
    alert('Vui lòng nhập tên đám!');
    return;
  }
  
  const damsRef = ref(database, 'dams');
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
window.editDam = function(damId) {
  const currentName = allDams[damId].name;
  const newName = prompt('Nhập tên mới:', currentName);
  
  if (!newName || newName.trim() === '') {
    return;
  }
  
  const damRef = ref(database, `dams/${damId}`);
  update(damRef, {
    name: newName.trim()
  }).then(() => {
    alert('Cập nhật thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Xóa đám
window.deleteDam = function(damId) {
  const damName = allDams[damId].name;
  
  if (!confirm(`Bạn có chắc muốn xóa đám "${damName}"?\nTất cả dữ liệu sẽ bị xóa!`)) {
    return;
  }
  
  const damRef = ref(database, `dams/${damId}`);
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

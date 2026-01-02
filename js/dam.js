// js/dam.js
import { database } from './firebase.js';
import { ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Lấy ID đám từ URL
const urlParams = new URLSearchParams(window.location.search);
const damId = urlParams.get('id');

// Biến lưu trữ dữ liệu
let currentDamData = null;
let allTienMung = {};
let allChiPhi = {};

// Kiểm tra ID và khởi tạo
if (!damId) {
  alert('Không tìm thấy ID đám!');
  window.location.href = 'index.html';
} else {
  document.addEventListener('DOMContentLoaded', () => {
    loadDamData();
    setupEventListeners();
  });
}

// Thiết lập các event listeners
function setupEventListeners() {
  // Form tiền mừng - sử dụng submit event
  const formTienMung = document.getElementById('formTienMung');
  formTienMung.addEventListener('submit', (e) => {
    e.preventDefault();
    addTienMung();
  });
  
  // Form chi phí - sử dụng submit event
  const formChiPhi = document.getElementById('formChiPhi');
  formChiPhi.addEventListener('submit', (e) => {
    e.preventDefault();
    addChiPhi();
  });
  
  // Tìm kiếm người mừng
  document.getElementById('searchGuest').addEventListener('input', filterTienMung);
}

// Load dữ liệu đám từ Firebase
function loadDamData() {
  const damRef = ref(database, `dams/${damId}`);
  
  onValue(damRef, (snapshot) => {
    const data = snapshot.val();
    
    if (!data) {
      alert('Không tìm thấy dữ liệu đám!');
      window.location.href = 'index.html';
      return;
    }
    
    currentDamData = data;
    
    // Cập nhật tên đám
    document.getElementById('damName').textContent = data.name || 'Chưa đặt tên';
    
    // Lưu dữ liệu vào biến toàn cục
    allTienMung = data.tienMung || {};
    allChiPhi = data.chiPhi || {};
    
    // Hiển thị dữ liệu
    displayTienMung(allTienMung);
    displayChiPhi(allChiPhi);
    updateSummary();
  });
}

// Hiển thị danh sách tiền mừng
function displayTienMung(tienMungData) {
  const tbody = document.getElementById('tienMungList');
  
  if (Object.keys(tienMungData).length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">
          <p>Chưa có người mừng nào</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = '';
  
  // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
  const sortedEntries = Object.entries(tienMungData).sort((a, b) => {
    return (b[1].createdAt || 0) - (a[1].createdAt || 0);
  });
  
  sortedEntries.forEach(([guestId, guestData]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${guestData.name}</td>
      <td class="money positive">${formatMoney(guestData.amount)}</td>
      <td class="action-buttons">
        <button class="btn btn-warning btn-small" data-id="${guestId}" data-type="tienMung">✏️ Sửa</button>
        <button class="btn btn-danger btn-small" data-id="${guestId}" data-type="tienMung">🗑️ Xóa</button>
      </td>
    `;
    
    // Gắn event cho nút sửa
    tr.querySelector('.btn-warning').addEventListener('click', function() {
      editTienMung(this.dataset.id);
    });
    
    // Gắn event cho nút xóa
    tr.querySelector('.btn-danger').addEventListener('click', function() {
      deleteTienMung(this.dataset.id);
    });
    
    tbody.appendChild(tr);
  });
}

// Hiển thị danh sách chi phí
function displayChiPhi(chiPhiData) {
  const tbody = document.getElementById('chiPhiList');
  
  if (Object.keys(chiPhiData).length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">
          <p>Chưa có chi phí nào</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = '';
  
  // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
  const sortedEntries = Object.entries(chiPhiData).sort((a, b) => {
    return (b[1].createdAt || 0) - (a[1].createdAt || 0);
  });
  
  sortedEntries.forEach(([expenseId, expenseData]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${expenseData.name}</td>
      <td class="money">${formatMoney(expenseData.amount)}</td>
      <td class="action-buttons">
        <button class="btn btn-warning btn-small" data-id="${expenseId}" data-type="chiPhi">✏️ Sửa</button>
        <button class="btn btn-danger btn-small" data-id="${expenseId}" data-type="chiPhi">🗑️ Xóa</button>
      </td>
    `;
    
    // Gắn event cho nút sửa
    tr.querySelector('.btn-warning').addEventListener('click', function() {
      editChiPhi(this.dataset.id);
    });
    
    // Gắn event cho nút xóa
    tr.querySelector('.btn-danger').addEventListener('click', function() {
      deleteChiPhi(this.dataset.id);
    });
    
    tbody.appendChild(tr);
  });
}

// Cập nhật tổng kết
function updateSummary() {
  const totalTM = calculateTotal(allTienMung);
  const totalCP = calculateTotal(allChiPhi);
  const laiLo = totalTM - totalCP;
  
  document.getElementById('totalTienMung').textContent = formatMoney(totalTM);
  document.getElementById('totalChiPhi').textContent = formatMoney(totalCP);
  
  const laiLoElement = document.getElementById('laiLo');
  laiLoElement.textContent = (laiLo >= 0 ? '+' : '') + formatMoney(laiLo);
  
  // Đổi class cho box lãi/lỗ
  const laiLoBox = document.getElementById('laiLoBox');
  laiLoBox.className = 'summary-item';
  if (laiLo >= 0) {
    laiLoBox.classList.add('profit');
  } else {
    laiLoBox.classList.add('loss');
  }
}

// Tính tổng tiền từ object
function calculateTotal(dataObj) {
  if (!dataObj || Object.keys(dataObj).length === 0) return 0;
  return Object.values(dataObj).reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
}

// Format số tiền theo VND
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Thêm tiền mừng mới
function addTienMung() {
  const nameInput = document.getElementById('guestName');
  const amountInput = document.getElementById('guestAmount');
  
  const name = nameInput.value.trim();
  const amount = parseInt(amountInput.value);
  
  // Validate
  if (!name) {
    alert('Vui lòng nhập tên người mừng!');
    nameInput.focus();
    return;
  }
  
  if (!amount || amount <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ!');
    amountInput.focus();
    return;
  }
  
  // Push dữ liệu lên Firebase
  const tienMungRef = ref(database, `dams/${damId}/tienMung`);
  const newRef = push(tienMungRef);
  
  set(newRef, {
    name: name,
    amount: amount,
    createdAt: Date.now()
  }).then(() => {
    // Reset form
    document.getElementById('formTienMung').reset();
    nameInput.focus();
  }).catch((error) => {
    alert('Lỗi khi thêm tiền mừng: ' + error.message);
  });
}

// Sửa tiền mừng
function editTienMung(guestId) {
  const guest = allTienMung[guestId];
  
  if (!guest) {
    alert('Không tìm thấy dữ liệu!');
    return;
  }
  
  const newName = prompt('Nhập tên người mừng:', guest.name);
  
  if (!newName || newName.trim() === '') {
    return;
  }
  
  const newAmount = prompt('Nhập số tiền:', guest.amount);
  
  if (!newAmount || isNaN(newAmount) || parseInt(newAmount) <= 0) {
    alert('Số tiền không hợp lệ!');
    return;
  }
  
  // Cập nhật Firebase
  const guestRef = ref(database, `dams/${damId}/tienMung/${guestId}`);
  update(guestRef, {
    name: newName.trim(),
    amount: parseInt(newAmount)
  }).then(() => {
    alert('Cập nhật thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Xóa tiền mừng
function deleteTienMung(guestId) {
  const guest = allTienMung[guestId];
  
  if (!guest) {
    alert('Không tìm thấy dữ liệu!');
    return;
  }
  
  if (!confirm(`Bạn có chắc muốn xóa "${guest.name}"?`)) {
    return;
  }
  
  // Xóa khỏi Firebase
  const guestRef = ref(database, `dams/${damId}/tienMung/${guestId}`);
  remove(guestRef).then(() => {
    alert('Đã xóa thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Thêm chi phí mới
function addChiPhi() {
  const nameInput = document.getElementById('expenseName');
  const amountInput = document.getElementById('expenseAmount');
  
  const name = nameInput.value.trim();
  const amount = parseInt(amountInput.value);
  
  // Validate
  if (!name) {
    alert('Vui lòng nhập tên chi phí!');
    nameInput.focus();
    return;
  }
  
  if (!amount || amount <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ!');
    amountInput.focus();
    return;
  }
  
  // Push dữ liệu lên Firebase
  const chiPhiRef = ref(database, `dams/${damId}/chiPhi`);
  const newRef = push(chiPhiRef);
  
  set(newRef, {
    name: name,
    amount: amount,
    createdAt: Date.now()
  }).then(() => {
    // Reset form
    document.getElementById('formChiPhi').reset();
    nameInput.focus();
  }).catch((error) => {
    alert('Lỗi khi thêm chi phí: ' + error.message);
  });
}

// Sửa chi phí
function editChiPhi(expenseId) {
  const expense = allChiPhi[expenseId];
  
  if (!expense) {
    alert('Không tìm thấy dữ liệu!');
    return;
  }
  
  const newName = prompt('Nhập tên chi phí:', expense.name);
  
  if (!newName || newName.trim() === '') {
    return;
  }
  
  const newAmount = prompt('Nhập số tiền:', expense.amount);
  
  if (!newAmount || isNaN(newAmount) || parseInt(newAmount) <= 0) {
    alert('Số tiền không hợp lệ!');
    return;
  }
  
  // Cập nhật Firebase
  const expenseRef = ref(database, `dams/${damId}/chiPhi/${expenseId}`);
  update(expenseRef, {
    name: newName.trim(),
    amount: parseInt(newAmount)
  }).then(() => {
    alert('Cập nhật thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Xóa chi phí
function deleteChiPhi(expenseId) {
  const expense = allChiPhi[expenseId];
  
  if (!expense) {
    alert('Không tìm thấy dữ liệu!');
    return;
  }
  
  if (!confirm(`Bạn có chắc muốn xóa "${expense.name}"?`)) {
    return;
  }
  
  // Xóa khỏi Firebase
  const expenseRef = ref(database, `dams/${damId}/chiPhi/${expenseId}`);
  remove(expenseRef).then(() => {
    alert('Đã xóa thành công!');
  }).catch((error) => {
    alert('Lỗi: ' + error.message);
  });
}

// Lọc tiền mừng theo từ khóa tìm kiếm
function filterTienMung() {
  const searchText = document.getElementById('searchGuest').value.toLowerCase().trim();
  
  if (searchText === '') {
    displayTienMung(allTienMung);
    return;
  }
  
  const filtered = {};
  
  Object.entries(allTienMung).forEach(([guestId, guestData]) => {
    if (guestData.name && guestData.name.toLowerCase().includes(searchText)) {
      filtered[guestId] = guestData;
    }
  });
  
  displayTienMung(filtered);
}

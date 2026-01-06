// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0JZrGgVRUp8h3LuFQdwjuFxi_p0p3Zvo",
  authDomain: "csdl-90950.firebaseapp.com",
  databaseURL: "https://csdl-90950-default-rtdb.firebaseio.com",
  projectId: "csdl-90950",
  storageBucket: "csdl-90950.firebasestorage.app",
  messagingSenderId: "756108541766",
  appId: "1:756108541766:web:ab326c8d55ced5e1c22f47",
  measurementId: "G-6BR2F8630M"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export database và auth để dùng ở các file khác
export const database = getDatabase(app);
export const auth = getAuth(app);

// Danh sách email admin (CÓ THỂ CHỈNH SỬA)
export const ADMIN_EMAILS = [
  'admin@example.com',      // Thay bằng email admin thực
  'admin@gmail.com'          // Có thể thêm nhiều admin
];

// Hàm kiểm tra user có phải admin không
export function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Hàm lấy user hiện tại
export function getCurrentUser() {
  return auth.currentUser;
}

// Hàm format tiền VND
export function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
}

// Hàm tính tổng từ object
export function calculateTotal(dataObj) {
  if (!dataObj || Object.keys(dataObj).length === 0) return 0;
  return Object.values(dataObj).reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
}

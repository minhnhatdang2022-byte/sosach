// js/auth-check.js
import { auth, isAdmin } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Kiểm tra user đã đăng nhập chưa
export function checkAuth(requireAdmin = false) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Chưa đăng nhập -> chuyển về trang login
        alert('Vui lòng đăng nhập!');
        window.location.href = 'login.html';
        reject('Not authenticated');
      } else {
        // Đã đăng nhập
        if (requireAdmin && !isAdmin(user.email)) {
          // Cần quyền admin nhưng không phải admin
          alert('Bạn không có quyền truy cập trang này!');
          window.location.href = 'index.html';
          reject('Not admin');
        } else {
          resolve(user);
        }
      }
    });
  });
}

// Đăng xuất
export function logout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    }).catch((error) => {
      alert('Lỗi khi đăng xuất: ' + error.message);
    });
  }
}

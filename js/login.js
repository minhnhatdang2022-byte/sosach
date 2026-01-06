// js/login.js
import { auth, database, isAdmin } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Kiểm tra nếu đã đăng nhập thì chuyển về trang chính
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'index.html';
  }
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// Thiết lập event listeners
function setupEventListeners() {
  // Form đăng nhập
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Form đăng ký
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  
  // Toggle giữa login và register
  document.getElementById('toggleLink').addEventListener('click', toggleForms);
}

// Xử lý đăng nhập
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showError('Vui lòng nhập đầy đủ thông tin!');
    return;
  }
  
  // Disable nút submit
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Đang đăng nhập...';
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Đăng nhập thành công
      showSuccess('Đăng nhập thành công! Đang chuyển trang...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    })
    .catch((error) => {
      submitBtn.disabled = false;
      submitBtn.textContent = '🔐 Đăng Nhập';
      
      let errorMsg = 'Đăng nhập thất bại!';
      
      switch(error.code) {
        case 'auth/user-not-found':
          errorMsg = 'Email không tồn tại!';
          break;
        case 'auth/wrong-password':
          errorMsg = 'Mật khẩu không đúng!';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Email không hợp lệ!';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Quá nhiều lần thử. Vui lòng thử lại sau!';
          break;
        default:
          errorMsg = error.message;
      }
      
      showError(errorMsg);
    });
}

// Xử lý đăng ký
function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  
  if (!name || !email || !password) {
    showError('Vui lòng nhập đầy đủ thông tin!');
    return;
  }
  
  if (password.length < 6) {
    showError('Mật khẩu phải có ít nhất 6 ký tự!');
    return;
  }
  
  // Disable nút submit
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Đang đăng ký...';
  
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Lưu thông tin user vào database
      const userRef = ref(database, `users/${user.uid}`);
      return set(userRef, {
        name: name,
        email: email,
        isAdmin: isAdmin(email),
        createdAt: Date.now()
      });
    })
    .then(() => {
      showSuccess('Đăng ký thành công! Đang chuyển trang...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    })
    .catch((error) => {
      submitBtn.disabled = false;
      submitBtn.textContent = '✍️ Đăng Ký';
      
      let errorMsg = 'Đăng ký thất bại!';
      
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMsg = 'Email đã được sử dụng!';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Email không hợp lệ!';
          break;
        case 'auth/weak-password':
          errorMsg = 'Mật khẩu quá yếu!';
          break;
        default:
          errorMsg = error.message;
      }
      
      showError(errorMsg);
    });
}

// Toggle giữa form login và register
function toggleForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const formTitle = document.getElementById('formTitle');
  const toggleText = document.getElementById('toggleText');
  const toggleLink = document.getElementById('toggleLink');
  
  // Xóa thông báo lỗi
  hideMessages();
  
  if (loginForm.style.display === 'none') {
    // Đang ở register -> chuyển về login
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    formTitle.textContent = 'Đăng nhập vào hệ thống';
    toggleText.innerHTML = 'Chưa có tài khoản? <a id="toggleLink">Đăng ký ngay</a>';
  } else {
    // Đang ở login -> chuyển sang register
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    formTitle.textContent = 'Đăng ký tài khoản mới';
    toggleText.innerHTML = 'Đã có tài khoản? <a id="toggleLink">Đăng nhập</a>';
  }
  
  // Re-bind event cho link mới
  document.getElementById('toggleLink').addEventListener('click', toggleForms);
}

// Hiển thị lỗi
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  
  successDiv.classList.remove('show');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  
  setTimeout(() => {
    errorDiv.classList.remove('show');
  }, 5000);
}

// Hiển thị thành công
function showSuccess(message) {
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  
  errorDiv.classList.remove('show');
  successDiv.textContent = message;
  successDiv.classList.add('show');
}

// Ẩn tất cả thông báo
function hideMessages() {
  document.getElementById('errorMessage').classList.remove('show');
  document.getElementById('successMessage').classList.remove('show');
}

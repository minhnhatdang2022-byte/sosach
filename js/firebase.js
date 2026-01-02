// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

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

// Export database để dùng ở các file khác
export const database = getDatabase(app);

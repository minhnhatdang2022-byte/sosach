import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0JZrGgVRUp8h3LuFQdwjuFxi_p0p3Zvo",
  authDomain: "csdl-90950.firebaseapp.com",
  databaseURL: "https://csdl-90950-default-rtdb.firebaseio.com",
  projectId: "csdl-90950",
  storageBucket: "csdl-90950.firebasestorage.app",
  messagingSenderId: "756108541766",
  appId: "1:756108541766:web:ab326c8d55ced5e1c22f47"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtD5QiHF_VXgXpDyuyvCpeeNEZ_v91N4g",
  authDomain: "expensetracker-2a3e4.firebaseapp.com",
  projectId: "expensetracker-2a3e4",
  storageBucket: "expensetracker-2a3e4.appspot.com",
  messagingSenderId: "258504388610",
  appId: "1:258504388610:web:24b93485a44af3db9af71b",
  measurementId: "G-GR5RNYT101"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); // Google provider for authentication

export { auth, googleProvider };

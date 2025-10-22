import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

// TODO: Zastąp tymi wartościami z Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA74IxJtI3MDjhTA1fsUkvrlHl6uQBWrz8",
  authDomain: "opera-library.firebaseapp.com",
  projectId: "opera-library",
  storageBucket: "opera-library.firebasestorage.app",
  messagingSenderId: "681425758983",
  appId: "1:681425758983:web:24d4ba956a55423642b3a2",
  measurementId: "G-NB0ZTZ6551"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

export default app


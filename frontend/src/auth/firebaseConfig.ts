// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Covey Town Data Persistance Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyBRxfeLHHoWstxr53cVuWkRbrl4qV0EISc',
  authDomain: 'coveytown-data-persistence.firebaseapp.com',
  projectId: 'coveytown-data-persistence',
  storageBucket: 'coveytown-data-persistence.appspot.com',
  messagingSenderId: '897179875616',
  appId: '1:897179875616:web:57a6218aa32b83e185ff45',
  measurementId: 'G-TGNZ1J7EVZ',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

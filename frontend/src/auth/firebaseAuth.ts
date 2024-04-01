import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Signs up a new user with email and password.
 *
 * @param email The user's email address
 * @param password The user's password
 * @returns A promise containing the user credentials if a successful sign up has occurred
 */
export const signUpEmailPassword = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully:', userCredential.user);
    return userCredential;
  } catch (error) {
    const e = error as AuthError;
    console.error('Error signing up:', e.message);
    throw e;
  }
};

/**
 * Logs in an existing user with email and password.
 *
 * @param email The user's email address
 * @param password The user's password
 * @returns A Promise containing the user credentials if a successful log in has occurred
 */
export const logInEmailPassword = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in successfully:', userCredential.user);
    return userCredential;
  } catch (error) {
    const e = error as AuthError;
    console.error('Error logging in:', e.message);
    throw e;
  }
};

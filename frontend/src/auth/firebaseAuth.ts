import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
export const signUpWithEmailPassword = async (
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
export const logInWithEmailPassword = async (
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

/**
 * Signs up or signs in a user using their Google account.
 * The popup will handle the appropriate action based on the user's status.
 * If the user is new, they will be signed up. If they already have an account, they will be logged in.
 *
 * @returns Promise containing the user credential on successful sign-up/log-in
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();

  try {
    const userCredential = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', userCredential.user);
    return userCredential;
  } catch (error) {
    const e = error as AuthError;
    console.error('Error signing in with Google:', e.message);
    throw e;
  }
};

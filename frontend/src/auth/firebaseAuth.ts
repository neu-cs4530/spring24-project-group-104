import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  UserCredential,
  updateProfile,
  deleteUser,
  signOut,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Signs up a new user with username, email, and password.
 *
 * An email must be valid, the password must be at least 6 characters long, and the email must not be in use.
 * An email is valid is it contains an '@' and a '.' in the domain, no spaces, and no invalid characters.
 *
 * @param username The user's desired username
 * @param email The user's email address
 * @param password The user's password
 * @returns A promise containing the user credentials if a successful sign up has occurred,
 *          along with the username being set in the user's profile.
 */
export const signUpWithEmailPasswordAndUsername = async (
  username: string,
  email: string,
  password: string,
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: username,
    });

    console.log('Username successfully created:', userCredential.user.displayName);
    console.log('Email successfully created:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    const e = error as AuthError;

    let customMessage = 'An unexpected error occurred during sign up.';
    switch (e.code) {
      case 'auth/invalid-email':
        customMessage = 'The email address is not valid.';
        break;
      case 'auth/email-already-in-use':
        customMessage = 'The email address is already in use by another account.';
        break;
      case 'auth/weak-password':
        customMessage = 'The password is too weak.';
        break;
      case 'auth/network-request-failed':
        customMessage = 'A network error occurred. Please try again.';
        break;
    }
    throw new Error(customMessage);
  }
};

/**
 * Logs in an existing user with email and password.
 * Provides detailed error messages based on the error encountered during login.
 *
 * @param email The user's email address
 * @param password The user's password
 * @returns A Promise containing the user credentials if a successful log in has occurred
 * @throws {Error} Custom error message based on login failure reason
 */
export const logInEmailPassword = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in successfully. Their email is :', userCredential.user.email);
    return userCredential;
  } catch (error) {
    const e = error as AuthError;
    let customMessage = 'An unexpected error occurred during login.';
    switch (e.code) {
      case 'auth/invalid-email':
        customMessage = 'The email address is not valid.';
        break;
      case 'auth/user-disabled':
        customMessage = 'This user account has been disabled by an administrator.';
        break;
      case 'auth/invalid-credential':
        customMessage = 'Incorrect credentials. Please try again.';
        break;
      default:
        customMessage = e.message;
    }
    throw new Error(customMessage);
  }
};

/**
 * Signs out the currently logged-in user. Throws an error if no user is signed in.
 *
 * @returns A promise that resolves if the sign-out is successful.
 * @throws {Error} If no user is currently signed in.
 */
export const signOutCurrentUser = async (): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Attempted to sign out, but no user is currently signed in.');
  }

  try {
    await signOut(auth);
    console.log('User signed out successfully.');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Deletes the currently logged-in user.
 *
 * @returns A promise that resolves if the deletion is successful, or rejects with an error message.
 */
export const deleteCurrentUser = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Attepmted to delete the user, but no user is currently signed in.');
    }

    await deleteUser(user);
    console.log('User account deleted successfully.');
  } catch (error) {
    const e = error as AuthError;
    if (e.code === 'auth/requires-recent-login') {
      console.error(
        'User needs to re-authenticate. Please sign in again before trying to delete the account.',
      );
      throw new Error('Re-authentication required');
    } else {
      console.error('Error deleting user account:', e.message);
      throw new Error(e.message);
    }
  }
};

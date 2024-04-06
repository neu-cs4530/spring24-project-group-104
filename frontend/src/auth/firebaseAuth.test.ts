import {
  signUpWithEmailPasswordAndUsername,
  logInEmailPassword,
  deleteCurrentUser,
  signOutCurrentUser,
  updateUsername,
} from './firebaseAuth';
import { auth } from './firebaseConfig';
describe('Firebase Auth Services Integration Tests', () => {
  it('should create a new user with signUpWithEmailPasswordAndUsername', async () => {
    const username = 'test';
    const email = `testuser_${Date.now()}@test.com`;
    const password = 'testpassword123';
    const userCredential = await signUpWithEmailPasswordAndUsername(username, email, password);
    expect(userCredential.user.email).toBe(email);

    // Delete the user created for cleanup
    await deleteCurrentUser();
  });

  it(`should throw errors when trying to create a new user with signUpWithEmailPasswordAndUsername but there's an invalid email`, async () => {
    const username = 'test';
    let email = '';
    const password = 'password123';

    // Email without @
    email = 'fakeemail.com';
    await expect(
      signUpWithEmailPasswordAndUsername(username, email, password),
    ).rejects.toThrowError('The email address is not valid.');

    // Email with a space
    email = 'spaced email@gmail.com';
    await expect(
      signUpWithEmailPasswordAndUsername(username, email, password),
    ).rejects.toThrowError('The email address is not valid.');

    // Email without domain
    email = 'missingdomain@';
    await expect(
      signUpWithEmailPasswordAndUsername(username, email, password),
    ).rejects.toThrowError('The email address is not valid.');

    // Email with invalid chars in the domain
    email = 'test@doma!n.com';
    await expect(
      signUpWithEmailPasswordAndUsername(username, email, password),
    ).rejects.toThrowError('The email address is not valid.');
  });

  it('should throw errors when trying to create a new user with signUpWithEmailPasswordAndUsername but the email is in use', async () => {
    const username = 'test';
    const email = 'test@example.com';
    const password = 'redundantEmail123';

    // test@example.com is an email that already exists in firebase for testing purposes
    await expect(
      signUpWithEmailPasswordAndUsername(username, email, password),
    ).rejects.toThrowError('The email address is already in use by another account.');
  });

  it(`should throw errors when trying to create a new user with signUpWithEmailPasswordAndUsername but there's an invalid password`, async () => {
    const username = 'test';
    const email = 'testingpasswords@gmail.com';
    let password = '';

    // Password less than 6 letters
    password = 'short';
    await expect(
      signUpWithEmailPasswordAndUsername(username, email, password),
    ).rejects.toThrowError('The password is too weak.');
  });

  it('should log in an existing user with logInWithEmailPassword', async () => {
    // test@example.com is an email that already exists in firebase for testing purposes
    const email = 'test@example.com';
    const password = 'password123';
    const userCredential = await logInEmailPassword(email, password);
    expect(userCredential.user.email).toBe(email);
    expect(userCredential.user).toBe(auth.currentUser);

    // Signing out of the user's account
    await signOutCurrentUser();
  });

  it(`should throw errors when trying to log in with logInEmailPassword but there's an invalid email`, async () => {
    let email = '';
    const password = 'password123';

    // Email without @
    email = 'fakeemail.com';
    await expect(logInEmailPassword(email, password)).rejects.toThrowError(
      'The email address is not valid.',
    );

    // Email with a space
    email = 'spaced email@gmail.com';
    await expect(logInEmailPassword(email, password)).rejects.toThrowError(
      'The email address is not valid.',
    );

    // Email without domain
    email = 'missingdomain@';
    await expect(logInEmailPassword(email, password)).rejects.toThrowError(
      'The email address is not valid.',
    );
  });

  it('should throw errors when trying to log in with logInEmailPassword but the user has been disabled', async () => {
    const email = 'disabledUser@gmail.com';
    const password = 'password123';

    await expect(logInEmailPassword(email, password)).rejects.toThrowError(
      'This user account has been disabled by an administrator.',
    );
  });

  it('should throw errors when trying to log in with logInEmailPassword but there is no user with the email', async () => {
    const email = 'doesntexist@gmail.com';
    const password = 'password123';

    await expect(logInEmailPassword(email, password)).rejects.toThrowError(
      'Incorrect credentials. Please try again.',
    );
  });

  it('should throw errors when trying to log in with logInEmailPassword but the credentials are invalid.', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword123';

    await expect(logInEmailPassword(email, password)).rejects.toThrowError(
      'Incorrect credentials. Please try again.',
    );
  });

  it('should have a no current user before logging in, have a current user after logging in, and then no user after logging out', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    expect(auth.currentUser).toBeFalsy();
    const userCredential = await logInEmailPassword(email, password);
    expect(userCredential.user.email).toBe(email);
    expect(auth.currentUser).toBeTruthy();
    await signOutCurrentUser();
    expect(auth.currentUser).toBeFalsy();
  });

  it('should have a no current user before logging in, have a current user after logging in, and then no user after logging out', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    expect(auth.currentUser).toBeFalsy();
    const userCredential = await logInEmailPassword(email, password);
    expect(userCredential.user.email).toBe(email);
    expect(auth.currentUser).toBeTruthy();
    await signOutCurrentUser();
    expect(auth.currentUser).toBeFalsy();
  });

  it('should throw an error when trying to sign out but there is no user signed in', async () => {
    await expect(signOutCurrentUser()).rejects.toThrowError(
      'Attempted to sign out, but no user is currently signed in.',
    );
  });

  it('should delete a user appropriately after they have been created', async () => {
    const username = 'test';
    const email = `testuser_${Date.now()}@test.com`;
    const password = 'testpassword123';
    const userCredential = await signUpWithEmailPasswordAndUsername(username, email, password);
    expect(userCredential.user.email).toBe(email);
    expect(auth.currentUser).toBeTruthy();

    // Delete the user created
    await deleteCurrentUser();
    expect(auth.currentUser).toBeFalsy();
  });

  it('should throw an error when trying to delete a user when there is no current user', async () => {
    await expect(deleteCurrentUser()).rejects.toThrowError(
      'Attepmted to delete the user, but no user is currently signed in.',
    );
  });

  it(`should properly change a logged in user's username`, async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const userCredential = await logInEmailPassword(email, password);
    expect(userCredential.user.displayName).toBe('test');
    await updateUsername('CHANGED USERNAME');
    expect(userCredential.user.displayName).toBe('CHANGED USERNAME');

    // Changing the username back to the way it was before
    await updateUsername('test');
    expect(userCredential.user.displayName).toBe('test');

    // Signing out of the user's account
    await signOutCurrentUser();
    expect(auth.currentUser).toBeFalsy();
  });

  it(`should throw an error when trying to change a username when there is no user signed in`, async () => {
    await expect(updateUsername('This wont work')).rejects.toThrowError(
      `Couldn't update the username. No user currently signed in.`,
    );
  });
});

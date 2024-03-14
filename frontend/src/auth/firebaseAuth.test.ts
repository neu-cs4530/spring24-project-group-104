import { signUpWithEmailPassword, logInWithEmailPassword } from './firebaseAuth';
describe('Firebase Auth Services', () => {
  beforeEach(async () => {
    const email = 'existing@test.com';
    const password = 'password';
    await signUpWithEmailPassword(email, password);
  });

  it('should create a new user with signUpWithEmailPassword', async () => {
    const email = `testuser_${Date.now()}@test.com`;
    const password = 'testpassword123';
    const userCredential = await signUpWithEmailPassword(email, password);

    expect(userCredential.user.email).toBe(email);
  });

  it('should log in an existing user with logInWithEmailPassword', async () => {
    const email = 'existing@test.com';
    const password = 'password';
    const userCredential = await logInWithEmailPassword(email, password);
    expect(userCredential.user.email).toBe(email);
  });

  it('should log in a user after signing up with the same credentials right before', async () => {
    const email = `testuser_${Date.now()}@test.com`;
    const password = 'testpassword123';
    await signUpWithEmailPassword(email, password);
    const userCredential = await logInWithEmailPassword(email, password);

    expect(userCredential.user.email).toBe(email);
  });
});

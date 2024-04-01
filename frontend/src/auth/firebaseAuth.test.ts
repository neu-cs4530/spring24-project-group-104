import { signUpEmailPassword, logInEmailPassword } from './firebaseAuth';
describe('Firebase Auth Services Integration Tests', () => {
  afterEach(async () => {
    // Clean up the user created during the test
  });

  it('should create a new user with signUpWithEmailPassword', async () => {
    const email = `testuser_${Date.now()}@test.com`;
    const password = 'testpassword123';
    const userCredential = await signUpEmailPassword(email, password);

    expect(userCredential.user.email).toBe(email);
  });

  it('should log in an existing user with logInWithEmailPassword', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const userCredential = await logInEmailPassword(email, password);
    expect(userCredential.user.email).toBe(email);
  });

  it('should log in a user after signing up with the same credentials right before', async () => {
    const email = `testuser_${Date.now()}@test.com`;
    const password = 'testpassword123';
    await signUpEmailPassword(email, password);
    const userCredential = await logInEmailPassword(email, password);

    expect(userCredential.user.email).toBe(email);
  });
});

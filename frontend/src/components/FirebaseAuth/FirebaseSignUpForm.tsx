import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { signUpWithEmailPasswordAndUsername } from '../../auth/firebaseAuth';

interface FirebaseSignUpFormProps {
  onLoginSuccess: (username: string, uid: string) => void;
}

export default function FirebaseSignUpForm({
  onLoginSuccess,
}: FirebaseSignUpFormProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const toast = useToast();

  const handleSignUp = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        const userCredential = await signUpWithEmailPasswordAndUsername(username, email, password);
        const displayName = userCredential.user?.displayName;
        const uid = userCredential.user?.uid;
        if (displayName && uid) {
          onLoginSuccess(displayName, uid);
        }
        toast({
          title: 'Account created.',
          description: 'You have successfully signed up!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error creating account.',
          description: error instanceof Error ? error.message : String(error),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [email, password, username, toast],
  );
  const toggleForm = () => setShowForm(!showForm);

  return (
    <Box borderWidth='1px' borderRadius='lg' p={4}>
      <Flex height='100%' alignItems='center' justifyContent='center'>
        <Button onClick={toggleForm} mb={4} colorScheme='blue'>
          {showForm ? 'Hide Sign Up' : 'Sign Up'}
        </Button>
      </Flex>
      <Collapse in={showForm}>
        <form onSubmit={handleSignUp}>
          <Stack spacing={6}>
            <Heading as='h3' size='lg'>
              Sign Up
            </Heading>
            <Flex direction='column'>
              <FormControl isRequired mt={4}>
                <FormLabel>Username</FormLabel>
                <Input
                  type='text'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder='Choose a username'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Enter your email'
                />
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Enter your password'
                />
              </FormControl>
              <Button type='submit' colorScheme='blue' width='full' mt={4}>
                Sign Up
              </Button>
            </Flex>
          </Stack>
        </form>
      </Collapse>
    </Box>
  );
}

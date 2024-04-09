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
  Tooltip,
} from '@chakra-ui/react';
import { logInEmailPassword } from '../../auth/firebaseAuth';

interface FirebaseLoginFormProps {
  onLoginSuccess: (username: string, uid: string) => void;
}

export default function FirebaseLoginForm({ onLoginSuccess }: FirebaseLoginFormProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const toast = useToast();

  const handleLogin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        const userCredential = await logInEmailPassword(email, password);
        const displayName = userCredential.user?.displayName;
        const uid = userCredential.user?.uid;
        if (displayName && uid) {
          onLoginSuccess(displayName, uid);
        }
        toast({
          title: 'Logged in successfully.',
          description: 'You are now logged in!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error logging in.',
          description: error instanceof Error ? error.message : String(error),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [email, onLoginSuccess, password, toast],
  );

  const toggleForm = () => setShowForm(!showForm);

  return (
    <Box borderWidth='1px' borderRadius='lg' p={4}>
      <Flex height='100%' alignItems='center' justifyContent='center'>
        <Button onClick={toggleForm} mb={4} colorScheme='blue'>
          {showForm ? 'Hide Log In' : 'Log In'}
        </Button>
      </Flex>
      <Collapse in={showForm}>
        <form onSubmit={handleLogin}>
          <Stack spacing={6}>
            <Heading as='h3' size='lg'>
              Log In
            </Heading>
            <Flex direction='column'>
              <FormControl isRequired>
                <FormLabel>
                  Email
                  <Tooltip
                    label='• Must be a valid email associated with an existing account'
                    placement='right'>
                    <Button size='sm' ml={2}>
                      ?
                    </Button>
                  </Tooltip>
                </FormLabel>
                <Input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Enter your email'
                />
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel>
                  Password
                  <Tooltip label='• Must be at least 8 characters.' placement='right'>
                    <Button size='sm' ml={2}>
                      ?
                    </Button>
                  </Tooltip>
                </FormLabel>
                <Input
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Enter your password'
                />
              </FormControl>
              <Button type='submit' colorScheme='blue' width='full' mt={4}>
                Log In
              </Button>
            </Flex>
          </Stack>
        </form>
      </Collapse>
    </Box>
  );
}

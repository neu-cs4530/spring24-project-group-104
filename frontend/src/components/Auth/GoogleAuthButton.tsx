import React, { useCallback } from 'react';
import { Box, Button, Flex, useToast } from '@chakra-ui/react';
import { signInWithGoogle } from '../../auth/firebaseAuth';

interface GoogleAuthButtonProps {
  onLoginSuccess: (username: string, uid: string) => void;
}

export default function GoogleAuthButton({ onLoginSuccess }: GoogleAuthButtonProps): JSX.Element {
  const toast = useToast();

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const userCredential = await signInWithGoogle();
      const displayName = userCredential.user?.displayName;
      const uid = userCredential.user?.uid;
      console.log(
        'These are the user credentials:',
        userCredential.user?.displayName,
        userCredential.user?.uid,
      );
      if (displayName && uid) {
        onLoginSuccess(displayName, uid);
      }
      toast({
        title: 'Logged in successfully.',
        description: 'You are now logged in with Google!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error logging in with Google.',
        description: error instanceof Error ? error.message : String(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [onLoginSuccess, toast]);

  return (
    <Box borderWidth='1px' borderRadius='lg' p={4}>
      <Flex direction='column' alignItems='center' justifyContent='center' mb={4}>
        <Button type='submit' colorScheme='blue' mt={4} onClick={handleGoogleSignIn}>
          Sign in with Google
        </Button>
      </Flex>
    </Box>
  );
}

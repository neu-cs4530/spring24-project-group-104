import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { updateUsername } from '../../auth/firebaseAuth';

interface UsernameUpdatePopupProps {
  userName: string;
  setUserName: (newUserName: string) => void;
}

export default function UsernameUpdatePopup({
  userName,
  setUserName,
}: UsernameUpdatePopupProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tempUsername, setTempUsername] = useState(userName);
  const toast = useToast();

  const handleUsernameUpdate = async () => {
    if (!tempUsername.trim()) {
      toast({
        title: 'Invalid username',
        description: 'Username cannot be empty.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateUsername(tempUsername);

      setUserName(tempUsername);
      onClose();
      toast({
        title: 'Username updated',
        description: 'Your username has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update username:', error);
      toast({
        title: 'Update failed',
        description: `Failed to update username.`,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button onClick={onOpen} mt='4'>
        Update Username
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Username</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>New Username</FormLabel>
              <Input value={tempUsername} onChange={e => setTempUsername(e.target.value)} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleUsernameUpdate}>
              Update
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

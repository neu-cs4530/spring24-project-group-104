import {
  Box,
  Button,
  Heading,
  Input,
  StackDivider,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';
import useTownController from '../../hooks/useTownController';

interface FriendRequest {
  sender: {
    id: string;
    displayName: string;
  };
  receiver: {
    id: string;
    displayName: string;
  };
}

export default function SocialSidebar(): JSX.Element {
  const coveyTownController = useTownController();
  const userID = coveyTownController.userID;
  const players = coveyTownController.players;
  const [userName2, setUserName2] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friendList, setFriendList] = useState([]);
  const toast = useToast();

  const fetchFriendRequests = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/friends/requests/${userID}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIncomingRequests(data.incoming);
        setOutgoingRequests(data.outgoing);
      } else {
        console.error('Error fetching friend requests:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling friend requests route:', error);
    }
  }, [userID]);

  const getUserFriends = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/friends/${userID}`,
      );
      if (response.ok) {
        const data = await response.json();
        setFriendList(data);
      } else {
        console.error('Error fetching friend list:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling friend list route:', error);
    }
  }, [userID]);

  useEffect(() => {
    fetchFriendRequests();

    const intervalId = setInterval(fetchFriendRequests, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchFriendRequests, userID]);

  useEffect(() => {
    getUserFriends();
  }, [getUserFriends, incomingRequests, outgoingRequests]);

  const getIDFromUser = (userName: string) => {
    for (const player of players) {
      if (player.userName === userName) {
        return player.id;
      }
    }
    return '';
  };

  const handleSendRequest = async () => {
    const userID2 = getIDFromUser(userName2);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/friends/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userID1: userID,
            userID2: userID2,
          }),
        },
      );

      if (response.ok) {
        fetchFriendRequests();
      } else {
        const errorText = await response.text();
        toast({
          title: 'Error',
          description: errorText,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error calling friend request route:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while sending the friend request.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAcceptFriendRequest = async (requesterID: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/friends/requests`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requesterID,
            receiverID: userID,
            accept: true,
          }),
        },
      );

      if (response.ok) {
        fetchFriendRequests();
        getUserFriends();
      } else {
        console.error('Error accepting friend request:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling accept friend request route:', error);
    }
  };

  const handleRejectFriendRequest = async (requesterID: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/friends/requests`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requesterID,
            receiverID: userID,
            accept: false,
          }),
        },
      );

      if (response.ok) {
        fetchFriendRequests();
      } else {
        console.error('Error rejecting friend request:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling reject friend request route:', error);
    }
  };

  const handleDeleteFriendRequest = async (receiverID: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/friends/requests`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requesterID: userID,
            receiverID,
            accept: false,
          }),
        },
      );

      if (response.ok) {
        fetchFriendRequests();
      } else {
        console.error('Error deleting friend request:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling delete friend request route:', error);
    }
  };

  return (
    <VStack
      align='left'
      spacing={3}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      height='100%'
      divider={<StackDivider borderColor='gray.200' />}
      borderRadius='4px'>
      <Heading fontSize='xl' as='h1'>
        Players In This Town
      </Heading>
      <PlayersList />
      <InteractableAreasList />

      <Heading fontSize='l' as='h2' mb={2}>
        {' '}
        My Friends{' '}
      </Heading>
      <Box border='1px' borderColor='gray.200' borderRadius='md' p={2}>
        {friendList.length > 0 ? (
          <VStack align='stretch' spacing={2}>
            {friendList.map((friend: { id: string; displayName: string }) => (
              <Box key={friend.id} bg='gray.50' p={1}>
                <Text>{friend.displayName}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color='gray.500'>No friends yet</Text>
        )}
      </Box>

      <Heading fontSize='l' as='h1'>
        Send a friend request
      </Heading>
      <Input
        placeholder="Enter player's username"
        value={userName2}
        onChange={e => {
          setUserName2(e.target.value);
        }}
      />
      <Button onClick={handleSendRequest}>Send Request</Button>

      <Heading fontSize='l' as='h2' mb={2}>
        {' '}
        Friend Requests{' '}
      </Heading>
      <Box border='1px' borderColor='gray.200' borderRadius='md' p={2}>
        <Heading fontSize='s' as='h2' color='blue.500'>
          {' '}
          Incoming{' '}
        </Heading>
        {incomingRequests.length > 0 ? (
          <VStack align='stretch' spacing={2}>
            {incomingRequests.map(request => (
              <Box
                key={(request as { sender: { id: string } }).sender.id}
                bg='gray.50'
                p={2}
                borderRadius='md'
                display='flex'
                justifyContent='space-between'
                alignItems='center'>
                <Text>{request.sender.displayName}</Text>
                <Box>
                  <Button
                    size='xs'
                    colorScheme='green'
                    margin={1}
                    onClick={() => handleAcceptFriendRequest(request.sender.id)}
                    mr={2}>
                    Accept
                  </Button>
                  <Button
                    size='xs'
                    colorScheme='red'
                    margin={1}
                    onClick={() => handleRejectFriendRequest(request.sender.id)}>
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color='gray.500'>No incoming requests</Text>
        )}

        <Heading fontSize='md' as='h3' mt={4} mb={2} color='blue.700'>
          Outgoing
        </Heading>
        {outgoingRequests.length > 0 ? (
          <VStack align='stretch' spacing={2}>
            {outgoingRequests.map(request => (
              <Box
                key={request.receiver.id}
                bg='gray.50'
                p={2}
                borderRadius='md'
                display='flex'
                justifyContent='space-between'
                alignItems='center'>
                <Text>{request.receiver.displayName}</Text>
                <Button
                  size='xs'
                  colorScheme='red'
                  onClick={() => handleDeleteFriendRequest(request.receiver.id)}>
                  Delete
                </Button>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color='gray.500'>No outgoing requests</Text>
        )}
      </Box>
    </VStack>
  );
}

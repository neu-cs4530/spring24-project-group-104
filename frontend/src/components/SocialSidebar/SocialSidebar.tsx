import { Box, Button, Heading, Input, StackDivider, VStack, Text } from '@chakra-ui/react';
import { CheckIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';
import useTownController from '../../hooks/useTownController';
import { setDefaultResultOrder } from 'dns';

export default function SocialSidebar(): JSX.Element {
  const coveyTownController = useTownController();
  const userID = coveyTownController.userID;
  const userName1 = coveyTownController.userName;
  const players = coveyTownController.players;
  const [userName2, setUserName2] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [friendList, setFriendList] = useState([]);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/friends/requests/${userID}`);
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
  };

  const getUserFriends = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/friends/${userID}`);
      if (response.ok) {
        const data = await response.json();
        setFriendList(data);
      } else {
        console.error('Error fetching friend list:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling friend list route:', error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    getUserFriends();

    const intervalId = setInterval(fetchFriendRequests, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userID]);

  console.log('friend list', friendList);

  const getIDFromUser = (userName: string) => {
    for (const player of players) {
      if (player.userName === userName) {
        return player.id;
      }
      console.log('are we here');
    }
    return '';
  };

  const getUserFromID = (userID: string) => {
    for (const player of players) {
      if (player.id === userID) {
        return player.userName;
      }
      console.log('are we here');
    }
    return '';
  };

  const handleSendRequest = async () => {
    const userID2 = getIDFromUser(userName2);
    console.log('userID2:', userID2);
    try {
      const response = await fetch('http://localhost:8081/api/friends/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID1: userID,
          userID2: userID2,
        }),
      });

      if (response.ok) {
        const data = await response.text();
        console.log(data);

        fetchFriendRequests();
      } else {
        console.error('Error creating friend request:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling friend request route:', error);
    }
  };

  const handleAcceptFriendRequest = async (requesterID: string) => {
    console.log('requesterID:', requesterID);
    console.log('receiverID:', userID);
    try {
      const response = await fetch('http://localhost:8081/api/friends/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterID,
          receiverID: userID,
          accept: true,
        }),
      });

      if (response.ok) {
        console.log('Friend Request Accepted');
        fetchFriendRequests();
      } else {
        console.error('Error accepting friend request:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling accept friend request route:', error);
    }
  };

  const handleRejectFriendRequest = async (requesterID: string) => {
    try {
      const response = await fetch('http://localhost:8081/api/friends/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterID,
          receiverID: userID,
          accept: false,
        }),
      });

      if (response.ok) {
        console.log('Friend Request Rejected');
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
      const response = await fetch('http://localhost:8081/api/friends/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterID: userID,
          receiverID,
          accept: false,
        }),
      });

      if (response.ok) {
        console.log('Friend Request Deleted');
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
        Friends{' '}
      </Heading>
      <Box border='1px' borderColor='gray.200' borderRadius='md' p={2}>
        {friendList.length > 0 ? (
          <VStack align='stretch' spacing={2}>
            {friendList.map(friend => (
              <Box key={friend.id} bg='gray.50' p={1} borderRadius=''>
                <Text>{getUserFromID(friend.id)}</Text>
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
        onChange={e => setUserName2(e.target.value)}
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
                key={request.sender.id}
                bg='gray.50'
                p={2}
                borderRadius='md'
                display='flex'
                justifyContent='space-between'
                alignItems='center'>
                <Text>{request.sender.displayName}</Text>
                <Box>
                  <Button
                    size='sm'
                    colorScheme='green'
                    leftIcon={<CheckIcon />}
                    onClick={() => handleAcceptFriendRequest(request.sender.id)}
                    mr={2}>
                    Accept
                  </Button>
                  <Button
                    size='sm'
                    colorScheme='red'
                    leftIcon={<CloseIcon />}
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
                  size='sm'
                  colorScheme='red'
                  leftIcon={<DeleteIcon />}
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

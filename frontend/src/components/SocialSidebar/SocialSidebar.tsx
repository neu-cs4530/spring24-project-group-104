import { Box, Button, Heading, Input, StackDivider, VStack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';

interface SocialSidebarProps {
  userID: string;
  userName1: string;
  players: { id: string; userName: string }[];
}

export default function SocialSidebar({
  userID,
  userName1,
  players,
}: SocialSidebarProps): JSX.Element {
  const [userName2, setUserName2] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  useEffect(() => {
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

    fetchFriendRequests();

    const intervalId = setInterval(fetchFriendRequests, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userID]);

  console.log('players:', players);
  console.log('userID1:', userID);
  console.log('username:', userName1);

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
      } else {
        console.error('Error creating friend request:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling friend request route:', error);
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
              <Box key={request.sender.id} bg='gray.50' p={2} borderRadius='md'>
                <Text>{request.sender.displayName}</Text>
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
              <Box key={request.receiver.id} bg='gray.50' p={2} borderRadius='md'>
                <Text>{request.receiver.displayName}</Text>
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

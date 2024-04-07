import { Button, Heading, Input, StackDivider, VStack } from '@chakra-ui/react';
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
  // const userID = controller;
  // const username = controller.userName;
  // const players = controller.players;
  const [userName2, setUserName2] = useState('');

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
      spacing={2}
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

      <Heading fontSize='l' as='h1'>
        Friend Requests
      </Heading>
      <Heading fontSize='s' as='h2'>
        Incoming
      </Heading>
      <Heading fontSize='s' as='h2'>
        Outgoing
      </Heading>
    </VStack>
  );
}

import React, { useState, useEffect, FormEvent } from 'react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import MediaErrorSnackbar from './MediaErrorSnackbar/MediaErrorSnackbar';
import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
import { useAppState } from '../../state';
import { useParams } from 'react-router-dom';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Box, Divider, Flex, Heading, Text } from '@chakra-ui/react';
import TownSelection from '../../../../Login/TownSelection';
import { TownJoinResponse } from '../../../../../types/CoveyTownSocket';
import SignUpForm from '../../../../Auth/SignUpForm';
import LogInForm from '../../../../Auth/LogInForm';
import { setuid } from 'process';
import GoogleAuthButton from '../../../../Auth/GoogleAuthButton';
import Tutorial from '../../../../Auth/Tutorial';


export enum Steps {
 roomNameStep,
 deviceSelectionStep,
}

interface PreJoinScreensProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}


export default function PreJoinScreens({ isLoggedIn, setIsLoggedIn }: PreJoinScreensProps): JSX.Element {
 const { user } = useAppState();
 const { getAudioAndVideoTracks } = useVideoContext();
 const [mediaError, setMediaError] = useState<Error>();
 const [tutorialCompleted, setTutorialCompleted] = useState(false);
 const [username, setUsername] = useState('');
 const [uid, setUID] = useState('');



 useEffect(() => {
   if (!mediaError) {
     getAudioAndVideoTracks().catch(error => {
       console.log('Error acquiring local media:');
       console.dir(error);
       setMediaError(error);
     });
   }
 }, [getAudioAndVideoTracks, mediaError]);


 const handleSignUpSuccess = (username: string, uid: string) => {
  setIsLoggedIn(true);
  setUsername(username);
  setUID(uid);
 };

 
 const handleLoginSuccess = (username: string, uid: string) => {
  setIsLoggedIn(true);
  setUsername(username);
  setUID(uid);
  setTutorialCompleted(true);
 };

 let header;
 if (!isLoggedIn || !tutorialCompleted) {
  header = (
    <Flex justify="center" mb={4}>
        <Heading as="h2" size="3xl" textAlign="center" mb={6}>Covey.Town</Heading>
    </Flex>
  );
} 
  else {
  header = (
    <>
    <Flex justify="center" mb={4}>
        <Heading as="h2" size="3xl" textAlign="center" mb={6}>Covey.Town</Heading>
      </Flex>
    <Text p="4">
      Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat.
      To get started, setup your camera and microphone, choose a username, and then create a new town
      to hang out in, or join an existing one.
    </Text>
    </>
  );
  }

 let content;
 if (!isLoggedIn) {
  content = (
  <Box p={4} maxW="md" mx="auto" mt="5%">
      <Heading as="h3" size="lg" textAlign="center" mb={6}>
        Create an Account or Log In!
      </Heading>
      <Flex direction="column" gap={6}>
        <SignUpForm onLoginSuccess={handleSignUpSuccess} />
        <Flex align="center">
          <Divider />
          <Text px={2}>or</Text>
          <Divider />
        </Flex>
        <LogInForm onLoginSuccess={handleLoginSuccess} />
        <Flex align="center">
          <Divider />
          <Text px={2}>or</Text>
          <Divider />
        </Flex>
        <GoogleAuthButton onLoginSuccess={handleSignUpSuccess} />
      </Flex>
    </Box>
  );
} 
else if (!tutorialCompleted) {
  content = (
    <Tutorial onComplete={() => setTutorialCompleted(true)} />
  );
}
  else {
  content = (
    <Box>
      <DeviceSelectionScreen />
      <TownSelection userName={username} setUsername={setUsername} uid={uid} setIsLoggedIn={setIsLoggedIn} setTutorialCompleted={setTutorialCompleted}/>
    </Box>
  );
}

 return (
    <IntroContainer>
      <MediaErrorSnackbar error={mediaError} />
      {header}
      {content}
    </IntroContainer>
);
}

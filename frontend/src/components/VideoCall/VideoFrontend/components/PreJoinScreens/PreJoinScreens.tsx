import React, { useState, useEffect, FormEvent } from 'react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import MediaErrorSnackbar from './MediaErrorSnackbar/MediaErrorSnackbar';
import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
import { useAppState } from '../../state';
import { useParams } from 'react-router-dom';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import TownSelection from '../../../../Login/TownSelection';
import { TownJoinResponse } from '../../../../../types/CoveyTownSocket';
import FirebaseSignUpForm from '../../../../FirebaseAuth/FirebaseSignUpForm';
import FirebaseLoginForm from '../../../../FirebaseAuth/FirebaseLogInForm';
import { setuid } from 'process';


export enum Steps {
 roomNameStep,
 deviceSelectionStep,
}


export default function PreJoinScreens() {
 const { user } = useAppState();
 const { getAudioAndVideoTracks } = useVideoContext();
 const [mediaError, setMediaError] = useState<Error>();
 const [isLoggedIn, setIsLoggedIn] = useState(false);
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

 const handleLoginSuccess = (username: string, uid: string) => {
  setIsLoggedIn(true);
  setUsername(username);
  setUID(uid);
 };

 let content;
 if (!isLoggedIn) {
  content = (
    <Box>
      <FirebaseSignUpForm onLoginSuccess={handleLoginSuccess} />
      <FirebaseLoginForm onLoginSuccess={handleLoginSuccess} />
    </Box>
  );
} else {
  content = (
    <Box>
      <DeviceSelectionScreen />
      <TownSelection userName={username} uid={uid} />
    </Box>
  );
}

 return (
  <IntroContainer>
    <MediaErrorSnackbar error={mediaError} />
    <Heading as="h2" size="xl">Welcome to Covey.Town!</Heading>
    <Text p="4">
      Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat.
      To get started, setup your camera and microphone, choose a username, and then create a new town
      to hang out in, or join an existing one.
    </Text>
    {content}
  </IntroContainer>
);
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import assert from 'assert';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  ToastId,
  Tr,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Town } from '../../generated/client';
import useLoginController from '../../hooks/useLoginController';
import TownController from '../../classes/TownController';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import UsernameUpdatePopup from '../Auth/UpdateUsernamePopup';
import { indexOf } from 'lodash';

interface TownSelectionProps {
  userName: string;
  setUsername: (newUsername: string) => void;
  uid: string;
}

export default function TownSelection({
  userName,
  setUsername,
  uid,
}: TownSelectionProps): JSX.Element {
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<Town[]>();
  const [recentlyVistedTowns, setRecentlyVisitedTowns] = useState<Town[]>();
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const loginController = useLoginController();
  const { setTownController, townsService, usersService } = loginController;
  const { connect: videoConnect } = useVideoContext();

  const toast = useToast();

  const isMounted = useRef(true);

  const updateTownListings = useCallback(async () => {
    const alltowns = await townsService.listTowns();
    let recentlyVisited = new Array<string>();
    if (uid) {
      const userVisits = await usersService.listRecentlyVistedTowns(uid);
      recentlyVisited = userVisits
        .sort((a, b) => new Date(b.lastVisited).valueOf() - new Date(a.lastVisited).valueOf())
        .splice(0, 3)
        .map(visit => visit.townId);
    }
    const publicTowns = alltowns
      .filter(town => !recentlyVisited.includes(town.townID))
      .sort((a, b) => b.currentOccupancy - a.currentOccupancy);
    const recentlyVisitedTowns = recentlyVisited
      .map(id => alltowns.find(town => town.townID === id))
      .filter(town => town) as Town[];
    if (isMounted.current) {
      setCurrentPublicTowns(publicTowns);
      setRecentlyVisitedTowns(recentlyVisitedTowns);
    }
  }, [townsService, uid, usersService]);

  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(
    async (coveyRoomID: string) => {
      let connectWatchdog: NodeJS.Timeout | undefined = undefined;
      let loadingToast: ToastId | undefined = undefined;
      try {
        if (!userName || userName.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please select a username',
            status: 'error',
          });
          return;
        }
        if (!coveyRoomID || coveyRoomID.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please enter a town ID',
            status: 'error',
          });
          return;
        }
        const isHighLatencyTownService =
          process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL?.includes('onrender.com');
        connectWatchdog = setTimeout(() => {
          if (isHighLatencyTownService) {
            loadingToast = toast({
              title: 'Please be patient...',
              description:
                "The TownService is starting up - this may take 15-30 seconds, because it is hosted on a free Render.com service. Render.com's free tier automatically puts the TownService to sleep when it is inactive for 15 minutes.",
              status: 'info',
              isClosable: false,
              duration: null,
            });
          } else {
            loadingToast = toast({
              title: 'Connecting to town...',
              description: 'This is taking a bit longer than normal - please be patient...',
              status: 'info',
              isClosable: false,
              duration: null,
            });
          }
        }, 1000);
        setIsJoining(true);
        const newController = new TownController({
          userName,
          uid,
          townID: coveyRoomID,
          loginController,
        });
        await newController.connect();
        const videoToken = newController.providerVideoToken;
        assert(videoToken);
        await videoConnect(videoToken);
        setIsJoining(false);
        if (loadingToast) {
          toast.close(loadingToast);
        }
        clearTimeout(connectWatchdog);
        setTownController(newController);
      } catch (err) {
        setIsJoining(false);
        if (loadingToast) {
          toast.close(loadingToast);
        }
        if (connectWatchdog) {
          clearTimeout(connectWatchdog);
        }
        if (err instanceof Error) {
          toast({
            title: 'Unable to connect to Towns Service',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected error, see browser console for details.',
            status: 'error',
          });
        }
      }
    },
    [userName, uid, loginController, videoConnect, setTownController, toast],
  );

  const handleCreate = async () => {
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    const isHighLatencyTownService =
      process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL?.includes('onrender.com');
    let loadingToast: ToastId | undefined = undefined;
    const connectWatchdog = setTimeout(() => {
      if (isHighLatencyTownService) {
        loadingToast = toast({
          title: 'Please be patient...',
          description:
            "The TownService is starting up - this may take 15-30 seconds, because it is hosted on a free Render.com service. Render.com's free tier automatically puts the TownService to sleep when it is inactive for 15 minutes.",
          status: 'info',
          isClosable: false,
          duration: null,
        });
      } else {
        loadingToast = toast({
          title: 'Connecting to town...',
          description: 'This is taking a bit longer than normal - please be patient...',
          status: 'info',
          isClosable: false,
          duration: null,
        });
      }
    }, 2000);
    setIsJoining(true);
    try {
      const newTownInfo = await townsService.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic,
      });
      clearTimeout(connectWatchdog);
      setIsJoining(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage = (
          <p>
            This town will NOT be publicly listed. To re-enter it, you will need to use this ID:{' '}
            {newTownInfo.townID}
          </p>
        );
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: (
          <>
            {privateMessage}Please record these values in case you need to change the town:
            <br />
            Town ID: {newTownInfo.townID}
            <br />
            Town Editing Password: {newTownInfo.townUpdatePassword}
          </>
        ),
        status: 'success',
        isClosable: true,
        duration: null,
      });
      await handleJoin(newTownInfo.townID);
    } catch (err) {
      clearTimeout(connectWatchdog);
      setIsJoining(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      if (err instanceof Error) {
        toast({
          title: 'Unable to connect to Towns Service',
          description: err.toString(),
          status: 'error',
        });
      } else {
        console.trace(err);
        toast({
          title: 'Unexpected error, see browser console for details.',
          status: 'error',
        });
      }
    }
  };

  return (
    <>
      <form>
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg' textAlign='center'>
              Welcome,{' '}
              <Text as='span' color='blue.500'>
                {userName}
              </Text>
            </Heading>
          </Box>
          <UsernameUpdatePopup userName={userName} setUserName={setUsername} />
          <Box mt={4} borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Create a New Town
            </Heading>
            <Flex p='4'>
              <Box flex='1'>
                <FormControl>
                  <FormLabel htmlFor='townName'>New Town Name</FormLabel>
                  <Input
                    name='townName'
                    placeholder='New Town Name'
                    value={newTownName}
                    onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                  <Checkbox
                    id='isPublic'
                    name='isPublic'
                    isChecked={newTownIsPublic}
                    onChange={e => {
                      setNewTownIsPublic(e.target.checked);
                    }}
                  />
                </FormControl>
              </Box>
              <Box>
                <Button
                  data-testid='newTownButton'
                  onClick={handleCreate}
                  isLoading={isJoining}
                  disabled={isJoining}>
                  Create
                </Button>
              </Box>
            </Flex>
          </Box>
          <Heading p='4' as='h2' size='lg'>
            -or-
          </Heading>

          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Join an Existing Town
            </Heading>
            <Box borderWidth='1px' borderRadius='lg'>
              <Flex p='4'>
                <FormControl>
                  <FormLabel htmlFor='townIDToJoin'>Town ID</FormLabel>
                  <Input
                    name='townIDToJoin'
                    placeholder='ID of town to join, or select from list'
                    value={townIDToJoin}
                    onChange={event => setTownIDToJoin(event.target.value)}
                  />
                </FormControl>
                <Button
                  data-testid='joinTownByIDButton'
                  onClick={() => handleJoin(townIDToJoin)}
                  isLoading={isJoining}
                  disabled={isJoining}>
                  Connect
                </Button>
              </Flex>
            </Box>

            <Heading p='4' as='h4' size='md'>
              Select a public town to join
            </Heading>
            <Box maxH='500px' overflowY='scroll'>
              <Table>
                <TableCaption placement='top'>Recently Visited Towns</TableCaption>
                <Thead>
                  <Tr data-testid='recentlyVisited'>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                    <Th>Activity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentlyVistedTowns?.map(town => (
                    <Tr data-testid='recentlyVisited' key={town.townID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.townID}</Td>
                      <Td role='cell'>
                        {town.currentOccupancy}/{town.maximumOccupancy}
                        <Button
                          onClick={() => handleJoin(town.townID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy || isJoining}
                          isLoading={isJoining}>
                          Connect
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Box maxH='500px' overflowY='scroll'>
              <Table>
                <TableCaption placement='top'>Other Publicly Listed Towns</TableCaption>
                <Thead>
                  <Tr data-testid='publiclyListed'>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                    <Th>Activity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPublicTowns?.map(town => (
                    <Tr data-testid='publiclyListed' key={town.townID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.townID}</Td>
                      <Td role='cell'>
                        {town.currentOccupancy}/{town.maximumOccupancy}
                        <Button
                          onClick={() => handleJoin(town.townID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy || isJoining}
                          isLoading={isJoining}>
                          Connect
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}

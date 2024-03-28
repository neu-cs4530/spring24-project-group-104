import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../../hooks/useTownController';
import Button from '@material-ui/core/Button';
import { Checkbox, Divider, FormControl, FormLabel, Input, MenuItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, makeStyles } from '@material-ui/core';
import StatsIcon from '../../icons/StatsIcon';
import { useAppState } from '../../state';
import { UserStats } from '../../../../../types/CoveyTownSocket';


const useStyles = makeStyles({
    iconContainer: {
      position: 'relative',
      display: 'flex',
    },
});

export default function Stats() {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(Boolean)

    return (
        <>
            <Button
                data-cy-chat-button
                onClick={() => setIsOpen(true)}
                startIcon={
                    <div className={classes.iconContainer}>
                    <StatsIcon />
                    </div>
                }
            >
                Stats
            </Button>
            <StatsDialog
                open={isOpen}
                onClose={() => {
                setIsOpen(false);
                }}
            />
        </>
    );
};

interface StatsDialogProps {
    open: boolean;
    onClose(): void;
}
  
function StatsDialog({ open, onClose }: PropsWithChildren<StatsDialogProps>) {
    const townController = useTownController();
    const [stats, setStats] = useState<UserStats>()

    // useEffect(() => {
    //     setStats({
    //         firstJoined: new Date('December 17, 1995 03:24:00'),
    //         timeSpent: new Date(500),
    //         gameRecords: [
    //             {
    //                 gameName: 'Connect Four',
    //                 wins: 5,
    //                 losses: 2
    //             }
    //         ]
    //     })
    // }, [])

    useEffect(() => {
        townController.getUserStats().then(res => setStats(res))
    }, [townController])

    return (
        <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="xs">
        <DialogTitle>User Stats</DialogTitle>
        <DialogContent>
            <DialogContentText>User: {townController.userName}</DialogContentText>
            {stats ? 
                <>
                    <DialogContentText>First Joined: {stats.firstJoined.toLocaleDateString()}</DialogContentText>
                    <DialogContentText>Time Spent Online: {stats.timeSpent}</DialogContentText>
                    {stats.gameRecords.map(record => <>
                        <DialogContentText>{record.gameName} record: {record.wins} wins, {record.losses} losses, {Math.round(record.wins/(record.losses + record.wins)*100)}% win rate</DialogContentText>
                    </>)}
                </> 
            : <DialogContentText>Loading...</DialogContentText> }
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary" variant="contained" autoFocus>
            OK
            </Button>
        </DialogActions>
        </Dialog>
    );
}
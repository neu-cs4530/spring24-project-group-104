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

    useEffect(() => {
        if(open) {
            townController.getUserStats().then(res => setStats(res))
        }
    }, [townController, open])

    function formatTimeSpent(timeInSeconds: number) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        const formatUnit = (value: number, unit: string) => value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;

        const formattedHours = hours > 0 ? formatUnit(hours, 'Hour') : '';
        const formattedMinutes = minutes > 0 ? formatUnit(minutes, 'Minute') : '';
        const formattedSeconds = formatUnit(seconds, 'Second');
      
        const timeComponents = [formattedHours, formattedMinutes, formattedSeconds].filter(Boolean);
      
        if (timeComponents.length === 2 && formattedMinutes === '') {
          return timeComponents.join(' ').replace(/, $/, '');
        } else {
          return timeComponents.join(', ').replace(/, $/, '');
        }

      }

    return (
        <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="xs">
        <DialogTitle>User Stats</DialogTitle>
        <DialogContent>
            <DialogContentText>User: {townController.userName}</DialogContentText>
            {stats ? 
                <>
                    <DialogContentText>First Joined: {stats.firstJoined}</DialogContentText>
                    <DialogContentText>Time Spent Online in Covey.Town: {stats.timeSpent !== null ? formatTimeSpent(stats.timeSpent) : 'N/A'}</DialogContentText>
                    {stats.gameRecords.map(record => (
                        <DialogContentText key={record.gameName}>
                            {record.gameName} record: {record.wins} wins, {record.losses} losses, {Math.round(record.wins/(record.losses + record.wins)*100)}% win rate
                        </DialogContentText>
                    ))}
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
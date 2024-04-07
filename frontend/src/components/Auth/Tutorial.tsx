import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import TUTORIAL_STEPS from '../../auth/tutorialSteps';

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < TUTORIAL_STEPS.length) {
      setCurrentStep(nextStepIndex);
    } else {
      onComplete(); // Tutorial completed
    }
  };

  return (
    <Modal isOpen={true} onClose={onComplete} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{TUTORIAL_STEPS[currentStep].title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{TUTORIAL_STEPS[currentStep].description}</Text>
        </ModalBody>
        <ModalFooter>
          {currentStep < TUTORIAL_STEPS.length - 1 && (
            <Button colorScheme='gray' mr={3} onClick={onComplete}>
              Skip
            </Button>
          )}
          <Button colorScheme='blue' onClick={nextStep}>
            {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

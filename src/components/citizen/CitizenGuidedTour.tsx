import React from 'react';
import { RoleGuidedTour, CITIZEN_TOUR_STEPS, type TourStep } from '../common/RoleGuidedTour';

export { CITIZEN_TOUR_STEPS, type TourStep };

export interface CitizenGuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const CitizenGuidedTour: React.FC<CitizenGuidedTourProps> = (props) => {
  return <RoleGuidedTour role="CITIZEN" {...props} />;
};

export default CitizenGuidedTour;

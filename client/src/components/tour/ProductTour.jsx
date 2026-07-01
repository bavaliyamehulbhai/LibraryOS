import React, { useState, useEffect } from 'react';
import ReactJoyride, { STATUS } from 'react-joyride';

const ProductTour = () => {
  const [run, setRun] = useState(false);
  
  const steps = [
    {
      target: '.tour-sidebar',
      content: 'This is your main navigation. You can access books, students, and settings from here.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.tour-dashboard-cards',
      content: 'These cards give you a quick overview of your library\'s real-time health.',
      placement: 'bottom',
    },
    {
      target: '.tour-notifications',
      content: 'System alerts, overdue warnings, and announcements will appear here.',
      placement: 'left',
    },
    {
      target: '.tour-profile',
      content: 'Access your personal profile and billing settings here.',
      placement: 'left',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    }
  };

  // Mock auto start for demo purposes
  useEffect(() => {
    const hasToured = localStorage.getItem('has_toured');
    if (!hasToured) {
      setTimeout(() => setRun(true), 1000);
      localStorage.setItem('has_toured', 'true');
    }
  }, []);

  return (
    <ReactJoyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        }
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default ProductTour;

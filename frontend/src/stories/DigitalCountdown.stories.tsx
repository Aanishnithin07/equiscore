import React, { useState, useEffect } from 'react';
import { DigitalCountdown } from '../components/ds/DigitalCountdown/DigitalCountdown';

export default {
  title: 'Components/DigitalCountdown',
  component: DigitalCountdown,
  parameters: {
    layout: 'centered',
  }
};

const Wrapper = ({ offset }: { offset: number }) => {
    const [target] = useState(Date.now() + offset);
    return <DigitalCountdown targetTimeMs={target} />;
}

export const ActiveNormal = () => <Wrapper offset={100000000} />;
export const ActiveWarning = () => <Wrapper offset={30000000} />;
export const ActiveCritical = () => <Wrapper offset={10000} />;
export const Expired = () => <Wrapper offset={-1000} />;

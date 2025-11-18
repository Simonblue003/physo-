import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { View, Text } from 'react-native';

const Timer = forwardRef(({ seconds = 20, onFinish = () => {} }, ref) => {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    setRemaining(seconds);
    setRunning(true);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      onFinish();
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining, running]);

  useImperativeHandle(ref, () => ({
    togglePause: () => setRunning(r => !r),
    reset: () => { setRemaining(seconds); setRunning(false); }
  }));

  return (
    <View style={{ marginTop: 18, alignItems: 'center' }}>
      <Text style={{ fontSize: 36, fontWeight: '700' }}>{remaining}s</Text>
    </View>
  );
});

export default Timer;

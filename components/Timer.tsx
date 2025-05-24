import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TimerComponentProps = {};

const TimerComponent: React.FC<TimerComponentProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null); 

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTime !== null) {
          setCurrentTime(Date.now() - startTime);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startTime]);

  const handleStart = () => {
    setStartTime(Date.now() - currentTime);
    setIsRunning(true);
    setFinalTime(null);
  };

  const handleStop = () => {
    setIsRunning(false);
    setFinalTime(currentTime);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setFinalTime(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(currentTime)}</Text>

      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleStop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {finalTime !== null && (
        <View style={styles.finalTimeContainer}>
          <Text style={styles.finalTimeLabel}>Session Duration:</Text>
          <Text style={styles.finalTimeText}>{formatTime(finalTime)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalTimeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  finalTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTimeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TimerComponent;

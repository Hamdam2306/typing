export type TestStatus = 'idle' | 'running' | 'finished';

export interface TimerProps {
    initialTime?: number;
    onTimeEnd: () => void;
    isRunning: boolean;
    setIsRunning: (value: boolean) => void;
    isTimerRunning: boolean
    setIsTimerRunning: (value: boolean) => void;
    className?: string;
}

export interface Props {
    words: string[];
    currentWordIndex: number;
    currentCharIndex: number;
    typedChars: string[][];
    testEnded: boolean
}


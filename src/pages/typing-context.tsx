import { createContext, useContext, useState, type ReactNode,  } from 'react';

type TypingStats = {
  correctChars: number;
  incorrectChars: number;
  wpm: number;
  updateCorrectChars: (count: number) => void;
  updateIncorrectChars: (count: number) => void;
  calculateWpm: (timeLeft: number) => void;
};

const TypingStatsContext = createContext<TypingStats | undefined>(undefined);

export function TypingStatsProvider({ children }: { children: ReactNode }) {
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [wpm, setWpm] = useState(0);

  const value = {
    correctChars,
    incorrectChars,
    wpm,
    updateCorrectChars: (count: number) => setCorrectChars(prev => prev + count),
    updateIncorrectChars: (count: number) => setIncorrectChars(prev => prev + count),
    calculateWpm: (timeLeft: number) => {
      const timeElapsed = 10 - timeLeft;
      const minutes = timeElapsed / 60;
      const totalWords = correctChars / 5;
      const adjustedWpm = minutes > 0 ? totalWords / minutes : 0;
      setWpm(Math.round(adjustedWpm));
    }
  };

  return (
    <TypingStatsContext.Provider value={value}>
      {children}
    </TypingStatsContext.Provider>
  );
}

export function useTypingStats() {
    const context = useContext(TypingStatsContext);
    if (context === undefined) {
      throw new Error('useTypingStats must be used within a TypingStatsProvider');
    }
    return context;
  }
import { useCallback, useEffect, useRef, useState } from "react";
import { WordList } from "../components/word-list";
import { generateWord } from "../components/generate-words";
import Timer from "../components/timer";
import type { TestStatus } from "../components/types";
import { useOverlay } from "../components/overlay";
import { FaRedo } from 'react-icons/fa'; 

export default function TypingArea() {
  const [words, setWords] = useState<string[]>(generateWord());
  const [typedChars, setTypedChars] = useState<string[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isTimerRun, setTimerRunning] = useState(false);
  const [status, setStatus] = useState<TestStatus>('idle');
  const { setShowOverlay } = useOverlay();
  const btnRef = useRef<HTMLButtonElement>(null);
  // const [correctChars, setCorrectChars] = useState(0)
  // const [incorrectChars, setIncorrect] = useState(0)
  // const [wpm, setWpm] = useState(0)

  const handleTimeEnd = useCallback(() => {
    alert('Test complete');
    restart();
  }, []);

  const startTest = useCallback(() => {
    if (status === 'running') return;
    setStatus('running');
    setIsTestRunning(true);
    setTimerRunning(true);
  }, [status]);

  const restart = useCallback(() => {
    setTypedChars([]);
    setStatus('idle');
    setCurrentCharIndex(0);
    setCurrentWordIndex(0);
    setIsTestRunning(false);
    setTimerRunning(false);
    setTimerKey(prev => prev + 1);
    setWords(generateWord());
    setShowOverlay(false)
    btnRef.current?.blur()
  }, []);

  const isWordCorrect = (word: string, typed: string[]) => {
    return word.split("").every((char, idx) => char === typed[idx] && typed.length === word.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault()
        alert('settings')
      }

      if (e.key === 'Tab') {
        btnRef.current?.focus()
        e.preventDefault();
        setShowOverlay(true)
        setTimerKey(0)
      }

      if (e.key === "Backspace") {
        const updated = [...typedChars];
        const currentWord = updated[currentWordIndex] || [];
        const prevWordIndex = currentWordIndex - 1;
        const prevWordTyped = typedChars[prevWordIndex];
        const prevWordTarget = words[prevWordIndex];
        setShowOverlay(false);

        if (currentCharIndex === 0 && prevWordTyped && isWordCorrect(prevWordTarget, prevWordTyped)) {
          return;
        }

        if (currentCharIndex > 0) {
          currentWord[currentCharIndex - 1] = "";
          updated[currentWordIndex] = currentWord;
          setCurrentCharIndex(prev => prev - 1);
        } else if (currentWordIndex > 0) {
          const prevWordIndex = currentWordIndex - 1;
          const prevWord = typedChars[prevWordIndex] || [];
          if (prevWord.length > 0) {
            prevWord.pop();
            updated[prevWordIndex] = prevWord;
            setTypedChars(updated);
            setCurrentWordIndex(prevWordIndex);
            setCurrentCharIndex(prevWord.length);
          }
        }
      } else if (e.key === ' ') {
        const currentTyped = typedChars[currentWordIndex] || [];
        if (currentTyped.length === 0 || currentTyped.every(c => c === '' || c === undefined)) {
          return;
        }
        setCurrentWordIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
      else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowOverlay(false)
        btnRef.current?.blur()
        if (status === 'idle') {
          startTest();
        }
        const updated = [...typedChars];
        const currentWord = updated[currentWordIndex] || [];
        currentWord[currentCharIndex] = e.key;
        updated[currentWordIndex] = currentWord;
        setTypedChars(updated);
        setCurrentCharIndex(prev => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typedChars, currentCharIndex, currentWordIndex, status, startTest, words]);


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Timer
        key={timerKey}
        initialTime={10}
        onTimeEnd={handleTimeEnd}
        isRunning={isTestRunning}
        isTimerRunning={isTimerRun}
        setIsRunning={setIsTestRunning}
        setIsTimerRunning={setTimerRunning}
        className="text-black font-serif text-bold text-2xl mb-5"
        // onTimeUpdate = {(timeLeft) => calculateWpm(timeLeft)}
      />
      <div className="flex flex-col items-center gap-10">
        <WordList
          words={words}
          currentWordIndex={currentWordIndex}
          currentCharIndex={currentCharIndex}
          typedChars={typedChars}
        />
        <button
          onClick={restart}
          ref={btnRef}
          className="flex items-center gap-2 p-2 mt-4 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Restart test"
        >
          <FaRedo className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
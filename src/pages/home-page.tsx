import { useCallback, useEffect, useRef, useState } from "react";
import { WordList } from "../components/word-list";
import { generateWord } from "../components/generate-words";
import type { TestStatus } from "../components/types";
import { useOverlay } from "../components/overlay";
import { BiLock } from "react-icons/bi";
import { ChevronRight, Repeat2 } from "lucide-react";


const TypingTest = () => {
  const TOTAL_TIME = 20;
  const [words, setWords] = useState<string[]>(generateWord());
  const [typedChars, setTypedChars] = useState<string[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [showCapsLock, setShowCapsLock] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [typingArea, setTypingArea] = useState(true)

  const { setShowOverlay } = useOverlay();
  const btnRef = useRef<HTMLButtonElement>(null);
  //@ts-ignore
  const intervalRef = useRef<number>();

  const calculateWpm = useCallback(() => {
    if (!startTime) return 0;
    const minutes = (Date.now() - startTime) / 1000 / 60;
    if (minutes <= 0) return 0;
    let correct = 0;
    typedChars.forEach((chars, idx) => {
      const word = words[idx] || "";
      chars.forEach((c, i) => {
        if (word[i] === c) correct++;
      });
    });
    return Math.round((correct / 5) / minutes);
  }, [startTime, typedChars, words]);

  const startTest = useCallback(() => {
    if (status === "running") return;
    setStatus("running");
    setStartTime(Date.now());
    setTestEnded(false);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
  }, [status]);



  useEffect(() => {
    if (timeLeft <= 0 && status === "running") {
      window.clearInterval(intervalRef.current);
      setStatus("finished");
      setTestEnded(true);
      setTypingArea(false)
      const finalCorrect = typedChars.reduce((sum, chars, idx) => {
        const word = words[idx] || "";
        return (
          sum +
          chars.reduce((cSum, c, i) => (word[i] === c ? cSum + 1 : cSum), 0)
        );
      }, 0);
      setCorrectChars(finalCorrect);
      if (startTime) {
        const minutes = (Date.now() - startTime) / 1000 / 60;
        setWpm(Math.round((finalCorrect / 5) / minutes));
      }
    }
  }, [timeLeft, status, startTime, typedChars, words]);

  useEffect(() => {
    if (status !== "running") return;
    const wpmInterval = window.setInterval(() => {
      setWpm(calculateWpm());
    }, 200);
    return () => clearInterval(wpmInterval);
  }, [status, calculateWpm]);

  const restart = useCallback(() => {
    setTypingArea(true)
    window.clearInterval(intervalRef.current);
    setWords(generateWord());
    setTypedChars([]);
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setStatus("idle");
    setTimeLeft(TOTAL_TIME);
    setStartTime(null);
    setWpm(0);
    setCorrectChars(0);
    setTestEnded(false);
    setShowOverlay(false);
    btnRef.current?.blur();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (testEnded) return;
      setShowCapsLock(e.getModifierState("CapsLock"));

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
      } else if (e.key === "Tab") {
        e.preventDefault();
        btnRef.current?.focus();
        setShowOverlay(true);
      } else if (e.key === "Backspace") {
        setShowOverlay(false);
        btnRef.current?.blur();
        const updated = [...typedChars];
        if (currentCharIndex > 0) {
          updated[currentWordIndex].splice(currentCharIndex - 1, 1);
          setTypedChars(updated);
          setCurrentCharIndex((i) => i - 1);
        } else if (currentWordIndex > 0) {
          const prev = typedChars[currentWordIndex - 1] || [];
          setCurrentWordIndex((i) => i - 1);
          setCurrentCharIndex(prev.length);
        }
      } else if (e.key === " " && typedChars[currentWordIndex]?.length) {
        setCurrentWordIndex((i) => i + 1);
        setCurrentCharIndex(0);
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowOverlay(false);
        btnRef.current?.blur();
        if (status === "idle") startTest();

        // Extra character limitation (max 5 extra chars per word)
        const currentWord = words[currentWordIndex] || '';
        const currentTyped = typedChars[currentWordIndex] || [];
        if (currentTyped.length >= currentWord.length + 5) {
          return;
        }

        const updated = [...typedChars];
        updated[currentWordIndex] = updated[currentWordIndex] || [];
        updated[currentWordIndex][currentCharIndex] = e.key;
        setTypedChars(updated);
        setCurrentCharIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    typedChars,
    currentCharIndex,
    currentWordIndex,
    status,
    startTest,
    testEnded,
    setShowOverlay,
    words
  ]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {testEnded && (
        <div className="text-center flex flex-col items-center">
          <div className="text-2xl font-bold mb-2">Test Completed!</div>
          <div className="text-4xl font-bold text-[#eeeeee]">{wpm} WPM</div>
          <div className="text-gray-400 mt-2">
            {correctChars} correct characters
          </div>
          <button
              onClick={restart}
              ref={btnRef}
              className="flex items-center p-2 mt-4 rounded-xl hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Restart test"
            >
              <ChevronRight className="h-8 w-8"/>
              <span></span>
            </button>
        </div>
      )}

      {typingArea && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <div className="text-2xl font-bold font-serif">
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>


          {showCapsLock && (
            <div className="fixed top-4 right-4 z-10">
              <div className="flex items-center bg-yellow-100 border px-3 py-2 rounded-lg shadow-md">
                <BiLock className="w-5 h-5" />
                <span>Caps Lock On</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-10">
            <WordList
              words={words}
              currentWordIndex={currentWordIndex}
              currentCharIndex={currentCharIndex}
              typedChars={typedChars}
              testEnded={testEnded}
            />

            <button
              onClick={restart}
              ref={btnRef}
              className="flex items-center p-3 mt-4 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Restart test"
            >
            <Repeat2 size={28} strokeWidth={3} absoluteStrokeWidth />
              <span></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
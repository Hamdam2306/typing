import { useCallback, useEffect, useRef, useState } from "react";
import { WordList } from "../components/word-list";
import { generateWord } from "../components/generate-words";
import type { TestStatus } from "../components/types";
import { useOverlay } from "../components/overlay";
import { BiLock, BiSolidQuoteAltLeft } from "react-icons/bi";
import { ChevronRight, Repeat2 } from "lucide-react";
import { PiClockCountdownFill, PiCrownSimpleFill } from "react-icons/pi";
import { RiKeyboardFill } from "react-icons/ri";
import { FaAt, FaHashtag, FaInfoCircle, FaKeyboard, FaUserAlt, FaWrench } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { AiOutlineClockCircle, AiOutlineFontSize} from "react-icons/ai";
import { GoTriangleUp } from "react-icons/go";
import { FiTool } from "react-icons/fi";
import {  useNavigate } from "react-router-dom";


const TypingTest = () => {
  const TOTAL_TIME = 15;
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
  const [percent, setPercent] = useState(true)
  const [errorKey, setErrorkey] = useState(0)
  const navigate = useNavigate()


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
          sum + chars.reduce((cSum, c, i) => (word[i] === c ? cSum + 1 : cSum), 0)
        );
      }, 0);

      const totalLetters = typedChars.reduce((sum, arr) => sum + arr.length, 0)

      console.log(totalLetters)

      setErrorkey(
        Math.floor((finalCorrect / totalLetters) * 100)
      )


      setCorrectChars(finalCorrect);
      if (startTime) {
        const minutes = (Date.now() - startTime) / 1000 / 60;
        const result = Number(Math.round((finalCorrect / 4.5) / minutes))
        setWpm(result)
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
      const audio = new Audio("../public/click.wav");
      audio.volume = 1; 

      if (testEnded) return;
      setShowCapsLock(e.getModifierState("CapsLock"));

      if (e.ctrlKey && e.key === "k") {
        alert('settings')
        e.preventDefault();
      } else if (e.key === "Tab") {
        e.preventDefault();
        btnRef.current?.focus();
        setShowOverlay(true);
      }
      else if (e.key === "Backspace") {
        setShowOverlay(false);
        btnRef.current?.blur();

        if (
          currentCharIndex === 0 &&
          currentWordIndex > 0
        ) {
          const prevTyped = typedChars[currentWordIndex - 1].join("");
          const prevTarget = words[currentWordIndex - 1];
          if (prevTyped === prevTarget) {
            return;
          }
        }

        const updated = typedChars.map(arr => [...arr]); // chuqur nusxa
        if (currentCharIndex > 0) {
          updated[currentWordIndex].splice(currentCharIndex - 1, 1);
          setTypedChars(updated);
          setCurrentCharIndex(i => i - 1);

        } else if (currentWordIndex > 0) {
          const prev = updated[currentWordIndex - 1];
          setCurrentWordIndex(i => i - 1);
          setCurrentCharIndex(prev.length);
          setTypedChars(updated);
        }
      }
      else if (e.key === " " && typedChars[currentWordIndex]?.length) {
        setCurrentWordIndex((i) => i + 1);
        setCurrentCharIndex(0);
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        audio.currentTime = 0
        audio.play()

        setShowOverlay(false);
        btnRef.current?.blur();
        if (status === "idle") startTest();

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
    <div className="min-h-screen flex flex-col justify-start max-w-7xl mx-auto px-5 py-8">
      {testEnded ? (
        <div className="flex flex-col justify-center items-center text-center gap-10 min-h-screen">
          <h1 className="text-6xl font-bold text-white">Test Completed!</h1>

          <div className="flex flex-col gap-4">
            <div className="text-5xl font-bold text-green-400">{wpm} WPM</div>
            <div className="text-5xl font-bold text-red-400">{errorKey}%</div>
          </div>

          <button
            onClick={restart}
            ref={btnRef}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xl transition"
            aria-label="Restart test"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 text-white">
              <RiKeyboardFill className="text-3xl" />
              <h1 className="text-3xl font-bold">GoTyping</h1>

              <div className="flex items-center gap-3 ml-6 text-lg">
                <FaKeyboard className="hover:text-blue-400 cursor-pointer" />
                <PiCrownSimpleFill className="hover:text-yellow-400 cursor-pointer" />
                <FaInfoCircle className="hover:text-sky-400 cursor-pointer" />
                <IoIosSettings className="hover:text-gray-300 cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-white" onClick={() => {navigate('/account')}}>
              <FaUserAlt className="text-lg" />
              <button>Hurmatullayev</button>
            </div>
          </div>

          <div className="bg-[#575353] text-white rounded-xl px-3 py-2 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-center gap-5 text-sm font-medium max-w-4xl w-full mx-auto overflow-x-auto">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-white transition whitespace-nowrap">
                <FaAt />
                <span>punctuation</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-white transition whitespace-nowrap">
                <FaHashtag />
                <span>numbers</span>
              </div>

              <div className="w-[1px] h-4 bg-[#222] hidden md:block mx-2" />

              <div className="flex items-center gap-1 text-gray-100 cursor-pointer hover:text-white transition whitespace-nowrap">
                <AiOutlineClockCircle />
                <span>time</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-white transition whitespace-nowrap">
                <AiOutlineFontSize />
                <span>words</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-white transition whitespace-nowrap">
                <BiSolidQuoteAltLeft />
                <span>quote</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-white transition whitespace-nowrap">
                <GoTriangleUp className="text-xl" />
                <span>zen</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-white transition whitespace-nowrap">
                <FiTool />
                <span>custom</span>
              </div>
            </div>

            <div className="w-[1px] h-4 bg-[#222] hidden md:block mx-2" />

            <div className="flex items-center gap-5 flex-wrap md:flex-nowrap whitespace-nowrap">
              <span className="text-gray-100 cursor-pointer hover:text-white">15</span>
              <span className="text-gray-400 cursor-pointer hover:text-white">30</span>
              <span className="text-gray-400 cursor-pointer hover:text-white">60</span>
              <span className="text-gray-400 cursor-pointer hover:text-white">120</span>

              <FaWrench className="text-gray-400 cursor-pointer hover:text-white" />
            </div>

            {/* <div>English</div> */}
          </div>

          


          <div className="flex justify-start mb-1">
            <div className="text-3xl font-bold font-serif flex items-center gap-3 text-white">
              <PiClockCountdownFill />
              {formatTime(timeLeft)}
            </div>
          </div>

          {showCapsLock && (
            <div className="fixed top-4 left-4 z-50">
              <div className="flex items-center gap-2 bg-white border border-gray-400 px-4 py-2 rounded-lg shadow-md">
                <BiLock className="w-5 h-5 text-black" />
                <span className="text-sm font-medium text-black">Caps Lock On</span>
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition text-lg"
              aria-label="Restart test"
            >
              <Repeat2 size={24} strokeWidth={3} absoluteStrokeWidth />
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default TypingTest;
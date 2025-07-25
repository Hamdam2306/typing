import { useCallback, useEffect, useRef, useState } from "react";
import { WordList } from "../components/word-list";
import { generateWord } from "../components/generate-words";
import type { TestStatus } from "../components/types";
import { useOverlay } from "../components/overlay";
import { BiLock } from "react-icons/bi";
import { ChevronRight, RepeatIcon } from "lucide-react";
import { PiClockCountdownFill } from "react-icons/pi";
import { Navbar } from "./navbar";
import { useTyping } from "@/context/typing-context";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { auth, db } from "./auth/login/firebase";

const TypingTest = () => {
  const TOTAL_TIME = 30;
  const [words, setWords] = useState<string[]>(generateWord());
  const [typedChars, setTypedChars] = useState<string[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [_, setCorrectChars] = useState(0)
  const [showCapsLock, setShowCapsLock] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [__, setTypingArea] = useState(true)
  const { wpm, setWpm, errorKey, setErrorKey } = useTyping();
  const { setShowOverlay } = useOverlay();
  const btnRef = useRef<HTMLButtonElement>(null);
  //@ts-ignore
  const intervalRef = useRef<number>();
  const [accuracy, setAccuracy] = useState(0);
  const [user, setUser] = useState<any>(null);
  const audio = new Audio("../public/click.wav");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);


  const playSound = () => {
    audio.currentTime = 0;
    audio.play().catch((e) => {
      console.log("Sound blocked:", e.message);
    });
  };

  const increaseTestCounters = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        testCount: increment(1)
      });


      const statsRef = doc(db, "stats", "tests")
      await updateDoc(statsRef, {
        totalTests: increment(1)
      })
    } catch (error) {
      console.error("Statistikani oshirishda xatolik:", error);
    }
  };



  const saveScoreToFirebase = async (user: User, wpm: number, percentage: number) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const oldData = userSnap.data();
      const oldScore = oldData.score || 0;
      const oldPercentage = oldData.percentage || 0;

      let newScore = oldScore;
      let newPercentage = oldPercentage;

      if (wpm > oldScore) {
        newScore = wpm;
        newPercentage = percentage;
      }

      else if (wpm === oldScore && percentage > oldPercentage) {
        newPercentage = percentage;
      }

      if (newScore !== oldScore || newPercentage !== oldPercentage) {
        await updateDoc(userRef, {
          score: newScore,
          percentage: newPercentage,
          updatedAt: new Date(),
        });
        console.log("✅ Yangi natija saqlandi:", newScore, newPercentage);
      }
    } else {
      console.log("❌ Foydalanuvchi topilmadi Firestore'da.");
    }
  }
  const calculateWpm = useCallback(() => {
    if (!startTime) return 0;
    const minutes = (Date.now() - startTime) / 1000 / 60;
    if (minutes <= 0) return 0;

    let correctCharacters = 0;
    typedChars.forEach((chars, idx) => {
      const word = words[idx] || "";
      chars.forEach((c, i) => {
        if (word[i] === c) correctCharacters++;
      });
    });
    return Math.floor((correctCharacters / 4) / minutes);
  }, [startTime, typedChars, words]);


  const startTest = useCallback(() => {
    if (status === "running") return;
    setStatus("running");
    setStartTime(Date.now());
    setTestEnded(false);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    if(user) increaseTestCounters(user.uid)
  }, [status, user?.uid]);



  useEffect(() => {
    if (timeLeft <= 0 && status === "running") {
      window.clearInterval(intervalRef.current);
      setStatus("finished");
      setTestEnded(true);
      setTypingArea(false)

      let totalCorrectChars = 0;
      let totalTypedAttemptedChars = 0;
      let totalExpectedChars = 0;

      typedChars.forEach((chars, wordIdx) => {
        const word = words[wordIdx] || "";
        totalExpectedChars += word.length;

        chars.forEach((char, charIdx) => {
          totalTypedAttemptedChars++;
          if (word[charIdx] === char) {
            totalCorrectChars++;
          }
        });
      });

      if (startTime) {
        const minutes = (Date.now() - startTime) / 1000 / 60;
        const finalWpm = Math.floor((totalCorrectChars / 4) / minutes);
        setWpm(finalWpm);
      }

      let calculatedAccuracy = 0;
      if (totalTypedAttemptedChars > 0) {
        calculatedAccuracy = Math.floor((totalCorrectChars / totalTypedAttemptedChars) * 100);
      }
      setErrorKey(calculatedAccuracy);
      setAccuracy(calculatedAccuracy);

      if (user) {
        saveScoreToFirebase(user, wpm, calculatedAccuracy);
      }
    }
  }, [timeLeft, status, startTime, typedChars, words, setWpm, setErrorKey, user, wpm, accuracy]);

  useEffect(() => {
    if (status !== "running") return;
    const wpmInterval = window.setInterval(() => {
      setWpm(calculateWpm());
    }, 10);
    return () => clearInterval(wpmInterval);
  }, [status, calculateWpm, setWpm]);

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
    setErrorKey(0);
    setAccuracy(0);
    setTestEnded(false);
    setShowOverlay(false);
    btnRef.current?.blur();
  }, [setWpm, setErrorKey, setShowOverlay]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {

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
          const prevTyped = typedChars[currentWordIndex - 1]?.join("");
          const prevTarget = words[currentWordIndex - 1];

          if (prevTyped === prevTarget) {
            return;
          }
        }

        const updated = typedChars.map(arr => [...arr]);
        if (currentCharIndex > 0) {
          updated[currentWordIndex].splice(currentCharIndex - 1, 1);
          setTypedChars(updated);
          setCurrentCharIndex(i => i - 1);

        } else if (currentWordIndex > 0) {

          const prevWordIndex = currentWordIndex - 1;
          const prevTypedChars = updated[prevWordIndex] || [];
          setCurrentWordIndex(prevWordIndex);
          setCurrentCharIndex(prevTypedChars.length);
          setTypedChars(updated);
        }
      }
      else if (e.key === " " && typedChars[currentWordIndex]?.length) {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex((i) => i + 1);
          setCurrentCharIndex(0);
        }
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        playSound()

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
    <div>
      <Navbar />
      <div className=" flex flex-col justify-start max-w-7xl mx-auto">
        {testEnded ? (
          <div className="flex flex-col items-center text-center gap-10 mt-10">
            <h1 className="text-6xl font-bold text-white">Test Completed!</h1>

            <div className="flex flex-col gap-4">
              <div className="text-5xl font-bold">{wpm} WPM</div>
              <div className="text-5xl font-bold">{errorKey}%</div>
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
            {/* <div className="bg-[#575353] text-white rounded-xl px-3 py-2 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-center gap-5 text-sm font-medium max-w-4xl w-full mx-auto overflow-x-auto">
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

            </div> */}



            {showCapsLock && (
              <div className="fixed z-2 top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 bg-white border border-gray-400 px-4 py-3 rounded-lg shadow-md">
                  <BiLock className="w-5 h-5 text-black" />
                  <span className="text-sm font-medium text-black">Caps Lock On</span>
                </div>
              </div>
            )}

            <div className="flex justify-start mb-1">
              <div className="text-3xl font-bold font-serif flex items-center gap-3 text-white">
                <PiClockCountdownFill />
                {formatTime(timeLeft)}
              </div>
            </div>


            <div className="flex flex-col items-start">
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-300 text-white transition text-lg"
                  aria-label="Restart test"
                >
                  <RepeatIcon size={24} strokeWidth={3} absoluteStrokeWidth />
                </button>


                <div className="flex absolute bottom-1/12 gap-2 items-center text-[12px] ">
                  <button className="border bg-gray-300 text-black py-0 px-1 rounded-md">tab</button>
                  <div className="border bg-black text-gray-300 py-0 px-1 rounded-md">+</div>
                  <div className="border bg-gray-300 text-black py-0 px-1 rounded-md">enter</div>
                  <div>=</div>
                  <div>Restart</div>
                </div>

                {!user && (
                  <div className="absolute bottom-10/12 text-center text-sm text-red-500 mt-4">
                    ⚠️ Your results won't be saved unless you sign up or log in. ⚠️
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>



  );
};

export default TypingTest;
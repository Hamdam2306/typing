import React, { useCallback, useEffect, useRef, useState } from "react";
import { WordList } from "../components/word-list";
import type { TestStatus } from "../components/types";
import { useOverlay } from "../components/overlay";
import { BiLock } from "react-icons/bi";
import { ChevronRight, RepeatIcon } from "lucide-react";
import { Navbar } from "./navbar";
import { useTyping } from "@/context/typing-context";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { auth, db } from "./auth/login/firebase";
import { generateWord } from "@/components/generate-words";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { PiClockCountdownFill } from "react-icons/pi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGlobeAfrica } from "react-icons/fa";

type Language = 'english' | 'russian' | 'uzbek' | 'china'| 'french' | 'german'

const TypingTest = () => {
  const [language, setLanguage] = useState<Language>("english")
  const [words, setWords] = useState<string[]>(() => generateWord(language));
  const menubarTriggerRef = useRef<HTMLButtonElement>(null);
  const [typedChars, setTypedChars] = useState<string[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [_, setCorrectChars] = useState(0);
  const [showCapsLock, setShowCapsLock] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [__, setTypingArea] = useState(true);
  const { wpm, setWpm, errorKey, setErrorKey } = useTyping();
  const { setShowOverlay } = useOverlay();
  const btnRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [user, setUser] = useState<any>(null);
  const audio = new Audio("../public/click.wav");
  const [activeTab, setActiveTab] = useState('tab-1');
  const [activeTime, setActiveTime] = useState(30);
  const [activeWord, setActiveWord] = useState(10);
  const [___, setWordList] = useState(false)
  const [showWarning, setShowWarning] = useState(false);

  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];

  const   handleLanguageChange = (newLang: "english" | "uzbek" | 'russian' | 'china' | 'french' | 'german') => {
    setLanguage(newLang);
    restart()
  };

  useEffect(() => {

    restart();
  }, [language]);

  useEffect(() => {
    if (activeTab === 'tab-1') {
      setTimeLeft(activeTime);
    }
  }, [activeTime, activeTab]);

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
        testCount: increment(1),
      });

      const statsRef = doc(db, "stats", "tests");
      await updateDoc(statsRef, {
        totalTests: increment(1),
      });
    } catch (error) {
      console.error("Statistikani oshirishda xatolik:", error);
    }
  };

  const saveScoreToFirebase = async (
    user: User,
    wpm: number,
    percentage: number
  ) => {
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
      } else if (wpm === oldScore && percentage > oldPercentage) {
        newPercentage = percentage;
      }

      if (newScore !== oldScore || newPercentage !== oldPercentage) {
        await updateDoc(userRef, {
          score: newScore,
          percentage: newPercentage,
          updatedAt: new Date(),
        });
      }
    }
  };
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
    return Math.floor(correctCharacters / 4 / minutes);
  }, [startTime, typedChars, words]);

  const endTest = useCallback(() => {
    window.clearInterval(intervalRef.current as any);
    setStatus("finished");
    setTestEnded(true);
    setTypingArea(false);

    let totalCorrectChars = 0;
    let totalTypedAttemptedChars = 0;
    const wordsToConsider = activeTab === 'tab-2' ? words.slice(0, activeWord) : words;

    typedChars.forEach((chars, wordIdx) => {
      if (activeTab === 'tab-2' && wordIdx >= activeWord) return;

      const word = wordsToConsider[wordIdx] || "";

      chars.forEach((char, charIdx) => {
        totalTypedAttemptedChars++;
        if (word[charIdx] === char) {
          totalCorrectChars++;
        }
      });
    });

    let finalWpm = 0
    if (startTime) {
      const minutes = (Date.now() - startTime) / 1000 / 60;
      finalWpm = Math.floor(totalCorrectChars / 4 / minutes);
      setWpm(finalWpm);
    }

    let calculatedAccuracy = 0;
    if (totalTypedAttemptedChars > 0) {
      calculatedAccuracy = Math.floor(
        (totalCorrectChars / totalTypedAttemptedChars) * 100
      );
    }
    setErrorKey(calculatedAccuracy);
    setAccuracy(calculatedAccuracy);

    if (user) {
      saveScoreToFirebase(user, finalWpm, calculatedAccuracy);
    }
  }, [
    startTime,
    typedChars,
    words,
    setWpm,
    setErrorKey,
    user,
    accuracy,
    activeTab,
    activeWord,
    setAccuracy
  ]);


  const startTest = useCallback(() => {
    if (status === "running") return;
    setWordList(true)
    setStatus("running");
    setStartTime(Date.now());
    setTestEnded(false);
    if (activeTab === 'tab-1') {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    if (user) increaseTestCounters(user.uid);
  }, [status, user?.uid, activeTab]);

  useEffect(() => {
    if (activeTab === 'tab-1' && timeLeft <= 0 && status === "running") {
      endTest();
    } else if (activeTab === 'tab-2' && currentWordIndex >= activeWord && status === "running") {
      const lastWordTyped = typedChars[activeWord - 1];
      const targetLastWord = words[activeWord - 1];

      if (lastWordTyped && lastWordTyped.length >= targetLastWord.length) {
        endTest();
      }
    }
  }, [
    timeLeft,
    status,
    endTest,
    activeTab,
    activeWord,
    currentWordIndex,
    typedChars,
    words
  ]);

  useEffect(() => {
    if (status !== "running") return;
    const wpmInterval = window.setInterval(() => {
      setWpm(calculateWpm());
    }, 10);
    return () => clearInterval(wpmInterval);
  }, [status, calculateWpm, setWpm]);

  const restart = useCallback(() => {
    setTypingArea(true);
    window.clearInterval(intervalRef.current as any);
    setWords(generateWord(language));
    setTypedChars([]);
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setStatus("idle");
    setTimeLeft(activeTab === 'tab-1' ? activeTime : 0);
    setStartTime(null);
    setWpm(0);
    setCorrectChars(0);
    setErrorKey(0);
    setAccuracy(0);
    setTestEnded(false);
    setShowOverlay(false);
    btnRef.current?.blur();
    menubarTriggerRef.current?.blur()
  }, [setWpm, setErrorKey, setShowOverlay, activeTab, activeTime, language]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (testEnded) return;

    setShowCapsLock(e.getModifierState("CapsLock"));

    if (e.ctrlKey && e.key === "k") {
      alert("settings");
      e.preventDefault();
    } else if (e.key === "Tab") {
      e.preventDefault();
      btnRef.current?.focus();
      setShowOverlay(true);
    } else if (e.key === "Backspace") {
      setShowOverlay(false);
      btnRef.current?.blur();

      if (currentCharIndex === 0 && currentWordIndex > 0) {
        const prevTyped = typedChars[currentWordIndex - 1]?.join("");
        const prevTarget = words[currentWordIndex - 1];
        if (prevTyped === prevTarget) return;
      }

      const updated = typedChars.map((arr) => [...arr]);

      if (currentCharIndex > 0) {
        updated[currentWordIndex].splice(currentCharIndex - 1, 1);
        setTypedChars(updated);
        setCurrentCharIndex((i) => i - 1);
      } else if (currentWordIndex > 0) {
        const prevWordIndex = currentWordIndex - 1;
        const prevTypedChars = updated[prevWordIndex] || [];
        setCurrentWordIndex(prevWordIndex);
        setCurrentCharIndex(prevTypedChars.length);
        setTypedChars(updated);
      }
    } else if (e.key === " " && typedChars[currentWordIndex]?.length) {
      if (activeTab === 'tab-2' && currentWordIndex >= activeWord - 1) {
        endTest();
        return;
      }

      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // playSound();
      setShowOverlay(false);
      btnRef.current?.blur();
      if (status === "idle") startTest();

      const currentWord = words[currentWordIndex] || "";
      const currentTyped = typedChars[currentWordIndex] || [];

      if (currentTyped.length >= currentWord.length + 5) return;

      const updated = [...typedChars];
      updated[currentWordIndex] = updated[currentWordIndex] || [];
      updated[currentWordIndex][currentCharIndex] = e.key;
      setTypedChars(updated);
      setCurrentCharIndex((i) => i + 1);

      if (
        activeTab === 'tab-2' &&
        status === 'running' &&
        currentWordIndex === activeWord - 1 &&
        updated[activeWord - 1].length === words[activeWord - 1].length
      ) {
        endTest();
      }
    }
  }, [
    testEnded,
    typedChars,
    currentCharIndex,
    currentWordIndex,
    status,
    startTest,
    endTest,
    words,
    activeTab,
    activeWord,
    setShowOverlay,
    // Boshqa bog'liqliklar (dependencies)
  ]);



  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    restart();
  };

  const handleTimeOptionClick = (option: number, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTime(option);
    restart();
    e.currentTarget.blur()
  };

  const handleWordOptionClick = (option: number, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveWord(option);

    restart();
    e.currentTarget.blur()
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setShowWarning(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div>
      {showWarning && !user && (
        <div className="absolute left-6/16 items-center text-sm text-red-500 mt-4 ">
          ⚠️ Your results won't be saved unless you sign up or log in.⚠️
        </div>
      )}

      {showCapsLock && (
        <div className="fixed z-2 top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 bg-white border-2 border-gray-400 px-4 py-3 rounded-lg shadow-md">
            <BiLock className="w-5 h-5 text-black" />
            <span className="text-sm font-medium text-black">
              Caps Lock On
            </span>
          </div>
        </div>
      )}


      <div className=" flex flex-col justify-start max-w-7xl mx-auto">
        {testEnded ? (
          <div>
            <Navbar />
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
          </div>
        ) : (

          <div className="flex flex-col gap-10">
            <div>
              <Navbar />

              <div className="flex items-center gap-1 justify-center">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="bg-neutral-900 rounded-xl">
                  <TabsList className="rounded-md p-0 flex text-gray-600 ">
                    <TabsTrigger
                      value="tab-1"
                      className="data-[state=active]:text-[#eeeeee] data-[state=active]:border rounded-xl px-4 py-2 transition cursor-pointer"
                    >
                      time
                    </TabsTrigger>
                    <TabsTrigger
                      value="tab-2"
                      className="data-[state=active]:text-[#eeeeee] data-[state=active]:border rounded-xl px-4 py-2 transition cursor-pointer"
                    >
                      word
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-2 p-1 rounded-xl bg-neutral-900">

                  {activeTab === "tab-1" &&
                    timeOptions.map((option) => (
                      <button
                        key={option}
                        className={`px-3 py-1 rounded-xl text-sm transition cursor-pointer  ${activeTime === option
                          ? 'border text-[#eeeeee]'
                          : 'text-gray-600'
                          }`}
                        onClick={(e) => handleTimeOptionClick(option, e)}
                      >
                        {option}
                      </button>
                    ))}

                  {activeTab === "tab-2" &&
                    wordOptions.map((option) => (
                      <button
                        key={option}
                        className={`px-3 py-1 rounded-xl text-sm transition cursor-pointer ${activeWord === option
                          ? 'border text-[#eeeeee]'
                          : 'text-gray-600'
                          }`}
                        onClick={(e) => handleWordOptionClick(option, e)}
                      >
                        {option}
                      </button>
                    ))}
                </div>
              </div>

              <Menubar className="flex justify-center mt-4">
                <MenubarMenu>
                  <MenubarTrigger
                    ref={menubarTriggerRef}
                    className="cursor-pointer text-sm "
                  >
                    <div className="flex gap-1 items-center">
                      <FaGlobeAfrica />
                      language
                    </div>
                  </MenubarTrigger>

                  <MenubarContent
                    align="center"
                    className="fixed transform -translate-x-1/2 bg-black flex flex-col items-center min-w-64 max-w-2xl"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <MenubarItem
                      className="justify-center w-full text-center"
                      onClick={() => handleLanguageChange("english")}
                    >
                      english
                    </MenubarItem>
                    <MenubarItem
                      className="justify-center w-full text-center"
                      onClick={() => handleLanguageChange("uzbek")}
                    >
                      uzbek
                    </MenubarItem>
                    <MenubarItem
                      className="justify-center w-full text-center"
                      onClick={() => handleLanguageChange("russian")}
                    >
                      russian
                    </MenubarItem>
                    <MenubarItem
                      className="justify-center w-full text-center"
                      onClick={() => handleLanguageChange("french")}
                    >
                      french
                    </MenubarItem>
                    <MenubarItem
                      className="justify-center w-full text-center"
                      onClick={() => handleLanguageChange("german")}
                    >
                      german
                    </MenubarItem>
                    <MenubarItem
                      className="justify-center w-full text-center"
                      onClick={() => handleLanguageChange("china")}
                    >
                      chinese
                    </MenubarItem>
                  </MenubarContent>

                </MenubarMenu>
              </Menubar>



              <div className="flex absolute bottom-1/12 left-5/11 gap-2 items-center text-[12px] ">
                <button className="border bg-gray-300 text-black py-0 px-1 rounded-md">
                  tab
                </button>
                <div className="border bg-black text-gray-300 py-0 px-1 rounded-md">
                  +
                </div>
                <div className="border bg-gray-300 text-black py-0 px-1 rounded-md">
                  enter
                </div>
                <div>=</div>
                <div>Restart</div>
              </div>
            </div>


            <div>
              <div className="flex flex-col items-start ">
                <div className="flex items-center">
                  <div className="flex justify-start mb-2">
                    <div className="text-3xl font-bold font-serif flex items-center gap-3 text-white">
                      <PiClockCountdownFill />
                      {activeTab === 'tab-1' ? formatTime(timeLeft) : `${currentWordIndex}/${activeWord} words`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-10">

                  <WordList
                    words={activeTab === 'tab-2' ? words.slice(0, activeWord) : words}
                    currentWordIndex={currentWordIndex}
                    currentCharIndex={currentCharIndex}
                    typedChars={typedChars}
                    // testEnded={testEnded}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={restart}
                    ref={btnRef}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-300 text-white transition text-lg"
                    aria-label="Restart test"
                  >
                    <RepeatIcon size={24} strokeWidth={3} absoluteStrokeWidth />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;
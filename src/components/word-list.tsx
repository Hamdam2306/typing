import React, { useMemo, useRef, useState, useEffect } from "react";
// Props tipini o'zingizning faylingizdan to'g'ri import qiling
// import type { Props } from "./types"; 
import { useOverlay } from "../components/overlay";

// Props'ga onKeyDown funksiyasini qo'shing
// Bu funksiya ota-komponentdan keladi va klaviatura hodisalarini boshqaradi
type Props = {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: (string[])[];
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const WordList: React.FC<Props> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  onKeyDown, // Prop'ni qabul qilish
}) => {
  const { showOverlay, setShowOverlay } = useOverlay();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Yashirin input uchun ref
  const [maxCharsPerLine, setMaxCharsPerLine] = useState(68);

  // Komponent yuklanganda va overlay yopilganda input'ga fokus berish
  useEffect(() => {
    if (!showOverlay && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showOverlay]);

  // Konteyner o'lchami o'zgarganda qatordagi belgilar sonini qayta hisoblash
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const width = entry.contentRect.width;
        // O'rtacha belgi kengligini shrift o'lchamiga qarab moslashtiring
        const avgCharWidth = 19; 
        const newMaxChars = Math.floor(width / avgCharWidth);
        setMaxCharsPerLine(newMaxChars > 0 ? newMaxChars : 1);
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // So'zlarni qatorlarga ajratish logikasi
  const { lines, currentLine } = useMemo(() => {
    if (maxCharsPerLine <= 1) {
      return { lines: [words], currentLine: 0 };
    }

    const lines: string[][] = [];
    const wordToLineMap: number[] = [];
    let currentLine = 0;
    let currentLineChars = 0;
    let currentLineWords: string[] = [];

    words.forEach((word, wordIndex) => {
      const wordLength = word.length;
      const spaceNeeded = currentLineWords.length > 0 ? 1 : 0;

      if (
        currentLineChars + spaceNeeded + wordLength > maxCharsPerLine &&
        currentLineWords.length > 0
      ) {
        lines.push([...currentLineWords]);
        currentLineWords = [word];
        currentLineChars = wordLength;
        currentLine++;
      } else {
        currentLineWords.push(word);
        currentLineChars += spaceNeeded + wordLength;
      }
      wordToLineMap[wordIndex] = currentLine;
    });

    if (currentLineWords.length > 0) {
      lines.push(currentLineWords);
    }

    const currentLineIndex = wordToLineMap[currentWordIndex] || 0;
    return { lines, currentLine: currentLineIndex };
  }, [words, currentWordIndex, maxCharsPerLine]);

  // Faqat ko'rinadigan qatorlarni hisoblash
  const visibleLines = useMemo(() => {
    const maxVisibleLines = 3;
    let startLine = Math.max(0, currentLine - 1);
    if (startLine + maxVisibleLines > lines.length) {
      startLine = Math.max(0, lines.length - maxVisibleLines);
    }
    return lines.slice(startLine, startLine + maxVisibleLines);
  }, [lines, currentLine]);

  // So'zning umumiy indeksini olish
  const getWordIndex = (lineIndex: number, wordIndex: number) => {
    const startLine = Math.max(0, currentLine - 1);
    const actualLineIndex = startLine + lineIndex;
    if (actualLineIndex >= lines.length) return -1;

    let totalWords = 0;
    for (let i = 0; i < actualLineIndex; i++) {
      totalWords += lines[i].length;
    }
    return totalWords + wordIndex;
  };

  // Fokusni o'rnatish uchun funksiya
  const handleFocus = () => {
    if (showOverlay) {
        setShowOverlay(false);
    }
    inputRef.current?.focus();
  };

  return (
    // Asosiy konteyner bosilganda yashirin input'ga fokus beradi
    <div
      ref={containerRef}
      className="w-full h-full cursor-text"
      onClick={handleFocus}
      role="button" // Yaxshiroq semantika uchun
      tabIndex={-1}  // O'zi fokuslanmaydi, lekin JS orqali fokuslanishi mumkin
    >
      {/* YASHIRIN INPUT ELEMENTI
        - Bu element klaviatura hodisalarini ushlab olish uchun ishlatiladi.
        - U vizual tarzda ko'rinmaydi, lekin doim fokusda bo'ladi.
        - `onBlur` hodisasi fokus yo'qolganida uni qayta tiklaydi.
      */}
      <input
        ref={inputRef}
        type="text"
        className="absolute top-[-9999px] left-[-9999px] opacity-0 w-0 h-0"
        onKeyDown={onKeyDown}
        onBlur={() => {
            // Fokus yo'qolganida uni qayta tiklash (agar overlay ochiq bo'lmasa)
            if (!showOverlay) {
                inputRef.current?.focus();
            }
        }}
        // Mobil qurilmalarda avtomatik tuzatish va boshqa funksiyalarni o'chirish
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      <div className="flex relative flex-wrap gap-x-4 text-[32px] font-bold leading-relaxed max-w-7xl px-2">
        {showOverlay && (
          <div
            onClick={(e) => {
                e.stopPropagation(); // Orqa fondagi onClick ishlamasligi uchun
                handleFocus();
            }}
            onKeyDown={handleFocus}
            tabIndex={0}
            className="absolute top-0 left-0 backdrop-blur-[4px] inset-0 h-auto flex items-center justify-center text-xl z-50 animate-fadeIn"
          >
            <div className="p-2 text-[#ffffff] bg-black/5 rounded-lg text-3xl font-black">
              Click here or press any key to focus
            </div>
          </div>
        )}

        {visibleLines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap gap-x-4 relative">
            {line.map((word, wordIdx) => {
              const actualWordIndex = getWordIndex(lineIdx, wordIdx);
              if (actualWordIndex === -1) return null;

              const extraChars =
                typedChars[actualWordIndex]?.slice(word.length) || [];

              return (
                <div key={wordIdx} className="flex items-center"> {/* `gap-1` o'rniga flex */}
                  {word.split("").map((char, cIdx) => {
                    const userChar = typedChars[actualWordIndex]?.[cIdx];
                    let className = "text-gray-500";

                    if (actualWordIndex < currentWordIndex) {
                      const typedWord = typedChars[actualWordIndex]?.join("") || "";
                      if (typedWord.length < word.length && cIdx >= typedWord.length) {
                        className = "text-red-500";
                      } else {
                        className = userChar === char ? "text-white" : "text-red-500";
                      }
                    } else if (actualWordIndex === currentWordIndex) {
                      if (userChar == null) {
                        className = "text-gray-500";
                      } else {
                        className = userChar === char ? "text-white" : "text-red-500";
                      }
                    }

                    const isCursor = actualWordIndex === currentWordIndex && cIdx === currentCharIndex;

                    return (
                      <span key={cIdx} className={`relative inline-block ${className}`}>
                        {char}
                        {isCursor && (
                          <span className="absolute left-0 top-0 w-[3px] h-full bg-[#eeeeee] animate-pulse" />
                        )}
                      </span>
                    );
                  })}

                  {/* So'z oxiridagi kursor */}
                  {actualWordIndex === currentWordIndex &&
                    currentCharIndex === word.length && (
                      <span className="relative inline-block h-[1em] w-[2px]">
                        <span className="absolute left-0 top-0 w-full h-full bg-[#eeeeee] animate-pulse" />
                      </span>
                    )}
                  
                  {/* Qo'shimcha kiritilgan belgilar */}
                  {extraChars.map((extraChar, idx) => (
                    <span
                      key={`extra-${idx}`}
                      className="text-red-500/50 relative inline-block"
                    >
                      {extraChar}
                    </span>
                  ))}

                  {/* Qo'shimcha belgilar oxiridagi kursor */}
                  {actualWordIndex === currentWordIndex &&
                    currentCharIndex === word.length + extraChars.length &&
                    extraChars.length > 0 && (
                      <span className="relative inline-block h-[1em] w-[2px]">
                        <span className="absolute left-0 top-0 w-full h-full bg-[#eeeeee] animate-pulse" />
                      </span>
                    )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

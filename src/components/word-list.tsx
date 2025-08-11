import React, { useMemo, useRef, useState, useEffect } from "react";
import type { Props } from "./types";
import { useOverlay } from "../components/overlay";


type CaretProps = {
  position: {
    left: number,
    top: number
  }
}

const Caret: React.FC<CaretProps> = ({ position }) => {
  const style = {
    transform: `translate(${position.left}px, ${position.top}px)`,
    transition: 'transform 0.1s ease-in-out',
  };

  return (
    <span
      style={style}
      className="absolute top-1 left-0 w-[2.5px] h-[42px] bg-[#ffffff] rounded-sm animate-pulse"
      aria-hidden="true"
    />
  );
};

export const WordList: React.FC<Props> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
}) => {
  const { showOverlay, setShowOverlay } = useOverlay();
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxCharsPerLine, setMaxCharsPerLine] = useState(68);

  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const width = entry.contentRect.width;
        const avgCharWidth = 19;
        const newMaxChars = Math.floor(width / avgCharWidth);
        setMaxCharsPerLine(newMaxChars > 0 ? newMaxChars : 1);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
        if (currentLineChars + spaceNeeded + wordLength > maxCharsPerLine && currentLineWords.length > 0) {
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

  const visibleLines = useMemo(() => {
    const maxVisibleLines = 3;
    let startLine = Math.max(0, currentLine - 1);
    if (startLine + maxVisibleLines > lines.length) {
      startLine = Math.max(0, lines.length - maxVisibleLines);
    }
    return lines.slice(startLine, startLine + maxVisibleLines);
  }, [lines, currentLine]);

  useEffect(() => {
    const activeWord = document.getElementById(`word-${currentWordIndex}`);
    if (!activeWord) return;

    let targetChar: HTMLElement | null = null;
    
    if (currentCharIndex < activeWord.children.length) {
        targetChar = activeWord.children[currentCharIndex] as HTMLElement;
    } else {
        targetChar = activeWord.children[activeWord.children.length - 1] as HTMLElement;
    }
    
    if (targetChar && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const charRect = targetChar.getBoundingClientRect();

      const left = currentCharIndex < activeWord.children.length
        ? charRect.left - containerRect.left
        : charRect.right - containerRect.left; // So'z oxirida bo'lsa, harfdan keyin

      const top = charRect.top - containerRect.top;
      
      setCaretPosition({ top, left, height: charRect.height });
    }
  }, [currentWordIndex, currentCharIndex, visibleLines]); // visibleLines o'zgarganda qayta hisoblash

  const getWordIndex = (lineIndex: number, wordIndex: number) => {
    const actualLineIndex = Math.max(0, currentLine - 1) + lineIndex;
    if (actualLineIndex >= lines.length) return -1;
    let totalWords = 0;
    for (let i = 0; i < actualLineIndex; i++) {
      totalWords += lines[i].length;
    }
    return totalWords + wordIndex;
  };

  return (
    <div ref={containerRef} className="w-full relative"> 
      {!showOverlay && <Caret position={caretPosition} />}

      <div className="flex flex-wrap gap-x-4 text-[32px] font-bold leading-relaxed max-w-7xl px-2">
        {showOverlay && (
          <div
            onClick={() => setShowOverlay(false)}
            onKeyDown={() => setShowOverlay(false)}
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

              const extraChars = (typedChars[actualWordIndex]?.slice(word.length)) || [];

              return (
                <div key={wordIdx} id={`word-${actualWordIndex}`} className="gap-1 relative">
                  {word.split("").map((char, cIdx) => {
                    const userChar = typedChars[actualWordIndex]?.[cIdx];
                    let className = "text-gray-500";

                    if (actualWordIndex < currentWordIndex) {
                        const typedWord = typedChars[actualWordIndex]?.join('') || '';
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

                    return (
                      <span key={cIdx} className={`relative inline-block ${className}`}>
                        {char}
                      </span>
                    );
                  })}

                  {extraChars.map((extraChar, idx) => (
                    <span key={`extra-${idx}`} className="text-red-500/50 relative inline-block">
                      {extraChar}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
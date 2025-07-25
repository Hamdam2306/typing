import React, { useMemo } from "react";
import type { Props } from "./types";
import { useOverlay } from "../components/overlay";

export const WordList: React.FC<Props> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
}) => {
  const { showOverlay, setShowOverlay } = useOverlay();

  const { lines, currentLine} = useMemo(() => {
    const maxCharsPerLine = 68; 
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

    return { lines, currentLine: currentLineIndex, wordToLineMap };
  }, [words, currentWordIndex]);

  const visibleLines = useMemo(() => {
    const maxVisibleLines = 3;
    let startLine = Math.max(0, currentLine - 1); 

    if (startLine + maxVisibleLines > lines.length) {
      startLine = Math.max(0, lines.length - maxVisibleLines);
    }

    return lines.slice(startLine, startLine + maxVisibleLines);
  }, [lines, currentLine]);

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
    <>
      <div>
        <div className="flex relative flex-wrap gap-x-4 text-[32px] font-bold leading-relaxed max-w-7xl px-2">
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
            <div key={lineIdx} className="flex flex-wrap gap-x-4 relative ">
              {line.map((word, wordIdx) => {
                const actualWordIndex = getWordIndex(lineIdx, wordIdx);
                if (actualWordIndex === -1) return null;

                const extraChars = (typedChars[actualWordIndex]?.slice(word.length)) || [];

                return (
                  <div key={wordIdx} className="gap-1">
                    {word.split("").map((char, cIdx) => {
                      const userChar = typedChars[actualWordIndex]?.[cIdx];
                      let className = "";

                      if (actualWordIndex < currentWordIndex) {
                        className = userChar === char ? "text-green-500" : "text-red-500";
                      } else if (actualWordIndex === currentWordIndex) {
                        if (userChar == null) {
                          className = "";
                        } else if (userChar === char) {
                          className = "text-green-500";
                        } else if (userChar !== char && userChar !== "") {
                          className = "text-red-500";
                        }
                      }

                      const isCursor = actualWordIndex === currentWordIndex && cIdx === currentCharIndex;

                      return (
                        <span
                          key={cIdx}
                          className={`relative inline-block ${className}`}
                        >
                          {char}
                          {isCursor && (
                            <span className="absolute left-0 top-0 w-[3px] h-full bg-[#eeeeee] animate-pulse" />
                          )}
                        </span>
                      );
                    })}

                    {actualWordIndex === currentWordIndex &&
                      currentCharIndex === word.length && (
                        <span className="relative inline-block h-[1em]">
                          <span className="absolute left-0 top-0 w-[2px] h-full bg-[#eeeeee] animate-pulse" />
                        </span>
                      )}

                    {extraChars.map((extraChar, idx) => {
                      return (
                        <span
                          key={`extra-${idx}`}
                          className="text-red-600/95 relative inline-block"
                        >
                          {extraChar}
                        </span>
                      );
                    })}

                    {actualWordIndex === currentWordIndex &&
                      currentCharIndex === word.length + extraChars.length &&
                      extraChars.length > 0 && (
                        <span className="relative inline-block h-[1em]">
                          <span className="absolute left-0 top-0 w-[2px] h-full bg-[#eeeeee] animate-pulse" />
                        </span>
                      )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

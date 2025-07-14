import React from "react";
import type { Props } from "./types";
import { useOverlay } from "../components/overlay";

export const WordList: React.FC<Props> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
}) => {
  const { showOverlay, setShowOverlay } = useOverlay();

  return (
    <>
      <div>
        <div className="flex relative flex-wrap gap-x-4 text-2xl font-bold leading-relaxed max-w-5xl px-2">
          {showOverlay && (
            <div
              onClick={() => setShowOverlay(false)}
              onKeyDown={() => setShowOverlay(false)}
              tabIndex={0}
              className="absolute top-0 left-0 backdrop-blur-[2px] inset-0 h-auto flex items-center justify-center text-xl z-50 animate-fadeIn"
            >
              <div className="p-2 text-white bg-black/5 rounded-lg text-xl">
                Click here or press any key to focus
              </div>
            </div>
          )}
          {words.map((word, wIdx) => {
            const extraChars = typedChars[wIdx]
              ?.slice(word.length)
              .slice(0, 5) || [];

            return (
              <div key={wIdx} className="gap-1">
                {word.split("").map((char, cIdx) => {
                  const userChar = typedChars[wIdx]?.[cIdx];
                  let className = "";

                  if (wIdx < currentWordIndex) {
                    className =
                      userChar === char ? "text-green-500" : "text-red-500";
                  } else if (wIdx === currentWordIndex) {
                    if (userChar == null) {
                      className = "";
                    } else if (userChar === char) {
                      className = "text-green-500";
                    } else if (userChar !== char && userChar !== "") {
                      className = "text-red-500";
                    }
                  }

                  const isCursor =
                    wIdx === currentWordIndex && cIdx === currentCharIndex;

                  return (
                    <span
                      key={cIdx}
                      className={`relative inline-block ${className}`}
                    >
                      {char}
                      {isCursor && (
                        <span className="absolute left-0 top-0 w-[2px] h-full bg-black animate-pulse" />
                      )}
                    </span>
                  );
                })}

                {wIdx === currentWordIndex &&
                  currentCharIndex === word.length && (
                    <span className="relative inline-block h-[1em]">
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-black animate-pulse" />
                    </span>
                  )}

                {extraChars.map((extraChar, idx) => {
                  const extraIndex = word.length + idx;
                  const isCursor =
                    wIdx === currentWordIndex &&
                    currentCharIndex === extraIndex;

                  return (
                    <span
                      key={`extra-${idx}`}
                      className="text-red-500 relative inline-block"
                    >
                      {extraChar}
                      {isCursor && (
                        <span className="absolute left-0 top-0 w-[2px] h-full bg-black animate-pulse" />
                      )}
                    </span>
                  );
                })}

                {wIdx === currentWordIndex &&
                  currentCharIndex === word.length + extraChars.length &&
                  extraChars.length > 0 && (
                    <span className="relative inline-block ">
                      <span className="absolute left-0 top-0 w-[2px] bg-black animate-pulse" />
                    </span>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
    onModeChange?: (mode: "time" | "word", value: number) => void;
}

const GoTypingModeSelector: React.FC<Props> = ({ onModeChange }) => {
    const [activeTab, setActiveTab] = useState<"tab-1" | "tab-2">("tab-1");
    const [activeTime, setActiveTime] = useState<number>(30);
    const [activeWord, setActiveWord] = useState<number>(25);

    const timeOptions = [15, 30, 60, 120];
    const wordOptions = [10, 25, 50, 100];

    const handleTabChange = (value: string) => {
        setActiveTab(value as "tab-1" | "tab-2");

        if (onModeChange) {
            const mode = value === "tab-1" ? "time" : "word";
            const defaultValue = value === "tab-1" ? activeTime : activeWord;
            onModeChange(mode, defaultValue);
        }
    };

    const handleTimeSelect = (value: number) => {
        setActiveTime(value);
        onModeChange?.("time", value);
    };

    const handleWordSelect = (value: number) => {
        setActiveWord(value);
        onModeChange?.("word", value);
    };

    return (
        <div className="flex items-center gap-1 justify-center">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="cursor-pointer bg-neutral-900">
                <TabsList className="rounded-md p-0 flex text-gray-600">
                    <TabsTrigger
                        value="tab-1"
                        className="data-[state=active]:text-[#eeeeee] rounded-md px-4 py-2 transition cursor-pointer"
                    >
                        time
                    </TabsTrigger>
                    <TabsTrigger
                        value="tab-2"
                        className="data-[state=active]:text-[#eeeeee] rounded-md px-4 py-2 transition cursor-pointer"
                    >
                        word
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Dynamic buttons */}
            <div className="flex gap-2 bg-neutral-900 p-1">
                {activeTab === "tab-1" &&
                    timeOptions.map((option) => (
                        <button
                            key={option}
                            className={`px-3 py-1 rounded-md text-sm transition ${activeTime === option
                                ? 'text-[#eeeeee]'
                                : 'text-gray-600'
                                }`}
                            onClick={() => handleTimeSelect(option)}
                        >
                            {option}
                        </button>
                    ))}

                {activeTab === "tab-2" &&
                    wordOptions.map((option) => (
                        <button
                            key={option}
                            className={`px-3 py-1 rounded-md text-sm transition ${activeWord === option
                                ? 'text-[#eeeeee]'
                                : 'text-gray-600'
                                }`}
                            onClick={() => handleWordSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
            </div>
        </div>
    );
};

export default GoTypingModeSelector;


{/* 
            <div className="flex items-center gap-1 justify-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-neutral-900">
                <TabsList className="rounded-md p-0 flex text-gray-600">
                  <TabsTrigger
                    value="tab-1"
                    className="data-[state=active]:text-[#eeeeee] rounded-md px-4 py-2 transition cursor-pointer"
                  >
                    time
                  </TabsTrigger>
                  <div className="w-[1px] h-[30px] bg-black"></div>
                  <TabsTrigger
                    value="tab-2"
                    className="data-[state=active]:text-[#eeeeee] rounded-md px-4 py-2 transition cursor-pointer"
                  >
                    word
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 bg-neutral-900 p-1">
                {activeTab === "tab-1" &&
                  timeOptions.map((option) => (

                    <button
                      key={option}
                      className={`px-3 py-1 rounded-md text-sm transition cursor-pointer ${activeTime === option
                        ? 'text-[#eeeeee]'
                        : 'text-gray-600'
                        }`}
                      onClick={() => setActiveTime(option)}
                    >
                      {option}
                    </button>
                  ))}

                {activeTab === "tab-2" &&
                  wordOptions.map((option) => (
                    <button
                      key={option}
                      className={`px-3 py-1 rounded-md text-sm transition cursor-pointer ${activeWord === option
                        ? 'text-[#eeeeee]'
                        : 'text-gray-600'
                        }`}
                      onClick={() => setActiveWord(option)}
                    >
                      {option}
                    </button>
                  ))}
              </div>
            </div> */}
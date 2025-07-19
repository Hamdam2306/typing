import { createContext, useContext, useState, type ReactNode } from "react";

interface TypingContextType {
    wpm: number;
    setWpm: (value: number) => void;
    errorKey: number;
    setErrorKey: (value: number) => void;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export const TypingProvider = ({ children }: { children: ReactNode }) => {
    const [wpm, setWpm] = useState(0);
    const [errorKey, setErrorKey] = useState(0);

    return (
        <TypingContext.Provider value={{ wpm, setWpm, errorKey, setErrorKey }}>
            {children}
        </TypingContext.Provider>
    );
};

export const useTyping = (): TypingContextType => {
    const context = useContext(TypingContext);
    if (!context) throw new Error("useTyping must be used within TypingProvider");
    return context;
};

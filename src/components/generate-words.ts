import { englishWord } from "@/languages/english";
import { russianWord } from "@/languages/russian";

export type Language = "english" | "russian";

export const generateWord = (lang: Language): string[] => {
  switch (lang) {
    case "english":
      return englishWord();
    case "russian":
      return russianWord();
    default:
      return [];
  }
};

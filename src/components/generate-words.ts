import { englishWord } from "@/languages/english";
import { uzbekWord } from "@/languages/uzbek";
import { russianWord } from "@/languages/russian";
import { chinaWord } from "@/languages/china";
import { frenchWord } from "@/languages/french";
import { germanWord } from "@/languages/german";

export type Language = "english" | "russian" | "uzbek" | 'china' | 'french' | 'german';

export const generateWord = (lang: Language): string[] => {
  switch (lang) {
    case "english":
      return englishWord();
    case "uzbek":
      return uzbekWord();
    case "russian":
      return russianWord();
    case "german":
      return germanWord();
    case "china":
      return chinaWord();
    case "french":
      return frenchWord();
    default:
      return [];
  }
};

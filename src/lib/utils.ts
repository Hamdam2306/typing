import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const getTestId = (mode: "time" | "words", value: number) => {
//   return `${mode}_${value}`;
// };
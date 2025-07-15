// import { useEffect, useState } from "react";
// import type { TimerProps } from "./types";

// // components/timer.tsx
// const Timer = ({
//   initialTime = 0,
//   onTimeEnd,
//   isRunning,  
//   setIsRunning,
//   isTimerRunning,  
//   setIsTimerRunning,
//   className = ""
// }: TimerProps) => {
//   const [time, setTime] = useState(initialTime);

//   useEffect(() => {
//     setTime(initialTime);
//   }, [initialTime]);

//   useEffect(() => {
//     let timerId: NodeJS.Timeout;

//     if (isRunning && isTimerRunning && time > 0) {
//       timerId = setTimeout(() => {
//         setTime(prev => prev - 1);
//       }, 1000);
//     } else if (time === 0 && isRunning) {
//       setIsRunning(false);
//       setIsTimerRunning(false);
//       onTimeEnd();
//     }

//     return () => {
//       if (timerId) clearTimeout(timerId);
//     };
//   }, [isRunning, isTimerRunning, time, onTimeEnd, setIsRunning, setIsTimerRunning]);

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className={`text-3xl ${className}`}>
//      ⏱ {formatTime(time)}
//     </div>
//   );
// };

// export default Timer;
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onComplete }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        if (Object.keys(newTimeLeft).length === 0) {
            if (onComplete) onComplete();
        }
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.entries(timeLeft).forEach(([interval, value]) => {
    timerComponents.push(
      <div key={interval} className="flex flex-col items-center w-20">
        <span className="text-4xl md:text-5xl font-bold text-slate-800">
          {String(value).padStart(2, '0')}
        </span>
        <span className="text-sm uppercase text-slate-500">{interval}</span>
      </div>
    );
  });

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200">
      <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">Presale Begins In</h3>
      <div className="flex justify-around items-start gap-2">
        {timerComponents.length ? timerComponents : <span className="text-2xl font-bold text-slate-800 p-8">Presale is open!</span>}
      </div>
    </div>
  );
};

export default CountdownTimer;
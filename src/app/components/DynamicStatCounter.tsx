import { useEffect, useRef, useState } from 'react';

type DynamicStatCounterProps = {
  initialValue: number;
  label: string;
  suffix?: string;
  loadValue: () => Promise<number>;
};

function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    const step = Math.ceil(target / (duration / 16));
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(current);
      if (current >= target) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, start]);

  return value;
}

export default function DynamicStatCounter({ initialValue, label, suffix = '', loadValue }: DynamicStatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [targetValue, setTargetValue] = useState(initialValue);
  const count = useCounter(targetValue, 1600, started);

  useEffect(() => {
    let mounted = true;

    const loadStatValue = async () => {
      try {
        const value = await loadValue();
        if (mounted) setTargetValue(value);
      } catch (error) {
        console.error(`Failed to load ${label} stat:`, error);
      }
    };

    void loadStatValue();

    return () => {
      mounted = false;
    };
  }, [loadValue, label]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true);
    }, { threshold: 0.3 });

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

import van, { State } from 'vanjs-core';

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

export const validateInitialMinutes = (seconds: number): void => {
  if (seconds < 0 || seconds > 5999) {
    throw new Error('Minutes must be between 0 and 5999');
  }
};

export type TimerStatus = 'ready' | 'running' | 'paused' | 'finished';
interface CountdownTimer {
  start: () => void;
  stop: (reason?: 'paused' | 'finished') => void;
  reset: () => void;
  toggle: () => void;
  getRemainingSeconds: () => number;
  isRunning: () => boolean;
  isFinished: () => boolean;
}

export const createCoundDownTimer = (
  initialSeconds: number = 1,
  initialStatus: TimerStatus = 'ready'
) => {
  validateInitialMinutes(initialSeconds);

  let intervalId: number | null = null;
  const remaining = van.state(initialSeconds) as State<number>;
  const status = van.state(initialStatus) as State<TimerStatus>;

  const start = () => {
    if (intervalId !== null || remaining.val <= 0) return;
    status.val = 'running';
    intervalId = window.setInterval(() => {
      remaining.val > 0 ? remaining.val-- : stop('finished');
    }, 1000);
  };

  const stop = (stopReason: 'paused' | 'finished' = 'paused') => {
    if (intervalId === null) return;
    window.clearInterval(intervalId);
    intervalId = null;
    status.val = stopReason;
  };

  const reset = () => {
    stop();
    remaining.val = initialSeconds;
    status.val = 'ready';
  };

  const toggle = () => (status.val === 'running' ? stop() : start());
  const getRemainingSeconds = (): number => remaining.val;
  const isRunning = (): boolean => status.val === 'running';
  const isFinished = (): boolean => status.val === 'finished';

  if (initialStatus === 'running') {
    intervalId = window.setInterval(() => {
      remaining.val > 0 ? remaining.val-- : stop('finished');
    }, 1000);
  }

  return {
    timer: {
      start,
      stop,
      reset,
      toggle,
      getRemainingSeconds,
      isRunning,
      isFinished,
    } as CountdownTimer,
  };
};

const { div, button } = van.tags;

interface CountdownTimerProps {
  initialSeconds: number;
}
export const CountdownTimer = ({
  initialSeconds = 1500,
}: CountdownTimerProps) => {
  const { timer } = createCoundDownTimer(initialSeconds, 'running');
  return button(
    {
      onclick: () => (timer.isFinished() ? timer.reset() : timer.toggle()),
      ondblclick: () => timer.reset(),
      style: () => `cursor: pointer; ${timer.isFinished() ? 'color:red;' : ''}`,
    },
    div(() => (timer.isRunning() ? '⏸' : '▶')),
    () => formatTime(timer.getRemainingSeconds())
  );
};

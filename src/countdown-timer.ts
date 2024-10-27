import van from 'vanjs-core';
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

interface CountdownTimer {
  start: () => void;
  stop: (reason: 'PAUSED' | 'FINISHED') => void;
  reset: () => void;
  toggle: () => void;
  getRemainingSeconds: () => number;
  isRunning: () => boolean;
  isFinished: () => boolean;
}

type TimerAction =
  | { type: 'READY' }
  | { type: 'TICK' }
  | { type: 'PAUSED' }
  | { type: 'FINISHED' };

interface TimerState {
  remaining: number;
  type: TimerAction['type'];
  intervalId: number | null;
}

export const createCountdownTimer = (
  initialSeconds: number = 1,
  initialType: TimerAction['type'] = 'READY'
) => {
  validateInitialMinutes(initialSeconds);

  const state = van.state<TimerState>({
    remaining: initialSeconds,
    type: initialType,
    intervalId: null,
  });

  const clearCurrentInterval = () => {
    if (state.val.intervalId !== null) {
      window.clearInterval(state.val.intervalId);
    }
  };

  const dispatch = (action: TimerAction) => {
    const currentState = state.val;

    switch (action.type) {
      case 'TICK': {
        if (currentState.type === 'TICK' || currentState.remaining <= 0) return;

        clearCurrentInterval();
        const newIntervalId = window.setInterval(() => {
          const newRemaining = state.val.remaining - 1;
          if (newRemaining <= 0) {
            dispatch({ type: 'FINISHED' });
          } else {
            state.val = {
              ...state.val,
              remaining: newRemaining,
            };
          }
        }, 1000);

        state.val = {
          ...currentState,
          type: 'TICK',
          intervalId: newIntervalId,
        };
        break;
      }

      case 'PAUSED':
      case 'FINISHED': {
        clearCurrentInterval();
        state.val = {
          ...currentState,
          type: action.type,
          intervalId: null,
        };
        break;
      }

      case 'READY': {
        clearCurrentInterval();
        state.val = {
          remaining: initialSeconds,
          type: 'READY',
          intervalId: null,
        };

        break;
      }

      default: {
        throw Error('Unknown action: ' + (action as TimerAction).type);
      }
    }
  };

  const timer: CountdownTimer = {
    start: () => dispatch({ type: 'TICK' }),
    stop: (reason: 'PAUSED' | 'FINISHED' = 'PAUSED') =>
      dispatch({ type: reason }),
    reset: () => dispatch({ type: 'READY' }),
    toggle: () => {
      if (state.val.type === 'TICK') {
        dispatch({ type: 'PAUSED' });
      } else if (state.val.remaining > 0) {
        dispatch({ type: 'TICK' });
      }
    },
    getRemainingSeconds: () => state.val.remaining,
    isRunning: () => state.val.type === 'TICK',
    isFinished: () => state.val.type === 'FINISHED',
  };

  if (initialType === 'TICK') {
    dispatch({ type: 'TICK' });
  }

  return { timer };
};

const { div, button } = van.tags;

interface CountdownTimerProps {
  initialSeconds: number;
}

export const CountdownTimer = ({
  initialSeconds = 1500,
}: CountdownTimerProps) => {
  const { timer } = createCountdownTimer(initialSeconds, 'TICK');
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

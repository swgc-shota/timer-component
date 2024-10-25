import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCoundDownTimer } from './countdown-timer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { timer } = createCoundDownTimer();
    expect(timer.getRemainingSeconds()).toBe(1);
    expect(timer.isRunning()).toBe(false);
    expect(timer.isFinished()).toBe(false);
  });

  it('should initialize with custom values', () => {
    const { timer } = createCoundDownTimer(5, 'ready');
    expect(timer.getRemainingSeconds()).toBe(5);
    expect(timer.isRunning()).toBe(false);
  });

  it('should start countdown when start is called', () => {
    const { timer } = createCoundDownTimer(3);
    timer.start();
    expect(timer.isRunning()).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(2);

    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(1);
  });

  it('should stop countdown when stop is called', () => {
    const { timer } = createCoundDownTimer(3);
    timer.start();
    vi.advanceTimersByTime(1000);

    timer.stop();
    expect(timer.isRunning()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(2); // Should not change after stop
  });

  it('should reset to initial value', () => {
    const { timer } = createCoundDownTimer(3);
    timer.start();
    vi.advanceTimersByTime(2000);

    timer.reset();
    expect(timer.getRemainingSeconds()).toBe(3);
    expect(timer.isRunning()).toBe(false);
  });

  it('should toggle between running and paused states', () => {
    const { timer } = createCoundDownTimer(3);
    timer.toggle(); // Start
    expect(timer.isRunning()).toBe(true);

    timer.toggle(); // Pause
    expect(timer.isRunning()).toBe(false);
  });

  it('should finish when countdown reaches zero', () => {
    const { timer } = createCoundDownTimer(2);
    timer.start();

    vi.advanceTimersByTime(2000);
    expect(timer.getRemainingSeconds()).toBe(0);
    setTimeout(() => {
      expect(timer.isFinished()).toBe(true);
    });
  });

  it('should auto-start when initialized with running status', () => {
    const { timer } = createCoundDownTimer(2, 'running');
    expect(timer.isRunning()).toBe(true);
  });

  it('should not start when remaining time is zero', () => {
    const { timer } = createCoundDownTimer(0);
    timer.start();
    expect(timer.isRunning()).toBe(false);
  });
});

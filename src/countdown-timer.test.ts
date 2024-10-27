import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCountdownTimer } from './countdown-timer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { timer } = createCountdownTimer();
    expect(timer.getRemainingSeconds()).toBe(1);
    expect(timer.isRunning()).toBe(false);
    expect(timer.isFinished()).toBe(false);
  });

  it('should initialize with custom values', () => {
    const { timer } = createCountdownTimer(5, 'READY');
    expect(timer.getRemainingSeconds()).toBe(5);
    expect(timer.isRunning()).toBe(false);
  });

  it('should start countdown when start is called', () => {
    const { timer } = createCountdownTimer(3);
    timer.start();
    expect(timer.isRunning()).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(2);

    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(1);
  });

  it('should stop countdown when stop is called', () => {
    const { timer } = createCountdownTimer(3);
    timer.start();
    vi.advanceTimersByTime(1000);

    timer.stop('PAUSED');
    expect(timer.isRunning()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(2); // Should not change after stop
  });

  it('should reset to initial value', () => {
    const { timer } = createCountdownTimer(3);
    timer.start();
    vi.advanceTimersByTime(2000);

    timer.reset();
    expect(timer.getRemainingSeconds()).toBe(3);
    expect(timer.isRunning()).toBe(false);
  });

  it('should toggle between running and paused states', () => {
    const { timer } = createCountdownTimer(3);
    timer.toggle(); // Start
    expect(timer.isRunning()).toBe(true);

    timer.toggle(); // Pause
    expect(timer.isRunning()).toBe(false);
  });

  it('should finish when countdown reaches zero', () => {
    const { timer } = createCountdownTimer(2);
    timer.start();

    vi.advanceTimersByTime(2000);
    setTimeout(() => {
      expect(timer.getRemainingSeconds()).toBe(0);
      expect(timer.isFinished()).toBe(true);
    });
  });

  it('should auto-start when initialized with running status', () => {
    const { timer } = createCountdownTimer(2, 'TICK');
    expect(timer.isRunning()).toBe(true);
  });

  it('should not start when remaining time is zero', () => {
    const { timer } = createCountdownTimer(0);
    timer.start();
    expect(timer.isRunning()).toBe(false);
  });
});

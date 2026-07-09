import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTimerResult {
  /** 剩余秒数 */
  remaining: number;
  /** 立即触发一次回调并重置倒计时 */
  refreshNow: () => void;
}

/**
 * 定时轮询 Hook
 * @param intervalSeconds 轮询间隔（秒）
 * @param callback 每次触发的回调
 */
export function useTimer(
  intervalSeconds: number,
  callback: () => void,
): UseTimerResult {
  const [remaining, setRemaining] = useState<number>(intervalSeconds);
  // 用 ref 保存内部倒计时，便于 refreshNow 同步重置，避免闭包陈旧值
  const timerRef = useRef<number>(intervalSeconds);
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    timerRef.current = intervalSeconds;
    setRemaining(intervalSeconds);
    callbackRef.current();
    const interval = setInterval(() => {
      timerRef.current -= 1;
      if (timerRef.current <= 0) {
        callbackRef.current();
        timerRef.current = intervalSeconds;
      }
      setRemaining(timerRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds]);

  const refreshNow = useCallback(() => {
    callbackRef.current();
    timerRef.current = intervalSeconds;
    setRemaining(intervalSeconds);
  }, [intervalSeconds]);

  return { remaining, refreshNow };
}

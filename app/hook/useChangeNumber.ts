import { useEffect, useRef, useState } from "react";

export function useChangeNumber(round: number) {
  // 要变化的数字
  const [number, setNumber] = useState(0);

  // 控制暂停与继续
  const [isPause, setPause] = useState(true);

  // 缓存存储动画帧函数
  const animated = useRef<any>();

  // 虚假的数字
  //  TODO: 暂时这样，后面再优化
  const canUseNumber: number[] = Array.from({ length: round }, (_, i) => i + 1);

  // 随机动画核心函数
  function animate() {
    const res = Math.floor(Math.random() * canUseNumber.length);
    setNumber(canUseNumber[res]);
    animated.current = requestAnimationFrame(() => animate());
  }

  useEffect(() => {
    if (isPause) {
      cancelAnimationFrame(animated.current);
    } else {
      animate();
    }
  }, [isPause]);

  return { number, isPause, setPause };
}

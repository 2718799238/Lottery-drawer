import { useEffect, useRef, useState } from "react";

export function useGetTargetNumber(usedNumbers: Set<number>) {
  const [curNum, setCurNum] = useState<number>(0);
  const [isPause, setPause] = useState(true);
  const animated = useRef<any>();

  // 获取未使用的数字
  const canUseNumber: number[] = [];
  for (let i = 0; i < 23; i++) {
    if (!usedNumbers.has(i + 1)) {
      canUseNumber.push(i + 1);
    }
  }
  console.log("🚀 ~ getTargetNumber ~ canUseNumber:", canUseNumber);

  //   开始随机数字
  function animate() {
    const res = Math.floor(Math.random() * canUseNumber.length);
    setCurNum(canUseNumber[res]);
    //   if (isPause) {
    //     cancelAnimationFrame(animated.current);
    //   }
    animated.current = requestAnimationFrame(() => animate());
  }
  animate();

  useEffect(() => {
    if (isPause) {
      cancelAnimationFrame(animated.current);
    }
  }, [isPause, curNum]);

  return { curNum, isPause, setPause };
}

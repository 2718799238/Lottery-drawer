"use client";

import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Modal from "./Component/Modal";
import {
  calculateWeeksBetweenDates,
  convertExcelDate,
  convertToChinese,
  formatTime,
  getWeekday,
} from "./utils";
import FileOpener from "./Component/input";

export default function Election() {
  const instance = useRef<any>();
  const [data, setData] = useState<any[]>([]);

  const [curRes, setCurRes] = useState<number[]>([0, 0, 0]);
  const [noUseTeam, setNoUseTeam] = useState<number[]>([]);
  const [changeValue, setChangeValue] = useState<number>(0);
  const [isPause, setPause] = useState(true);
  const [isAllSelected, setAllSelected] = useState(false);

  const [datad, setddd] = useState<any>();
  const [curFilePath, setCurFilePath] = useState<string | string[]>();
  const animated = useRef<any>();

  //   开始抽签
  function select() {
    if (data.length === 0) {
      alert("数据为空，请先添加数据");
      return;
    }

    const res = instance.current.extractionGroups();

    if (res) {
      setPause(false);
      getTargetNumber();
      setCurRes(() => [...res]);
    } else {
      setAllSelected(true);
      setNoUseTeam(instance.current.getNotFoundNumber());
    }
  }

  //   结束抽取
  function pause() {
    setPause(true);
    setNoUseTeam(instance.current.getNotFoundNumber());
  }

  //  控制动画数字切换的
  function getTargetNumber() {
    const canUseNumber: number[] = [
      23, 1, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ];

    function animate() {
      const res = Math.floor(Math.random() * canUseNumber.length);
      //   console.log(res);
      setChangeValue(canUseNumber[res]);
      if (isPause) {
        cancelAnimationFrame(animated.current);
      }
      animated.current = requestAnimationFrame(() => animate());
    }
    animate();
  }

  useEffect(() => {
    if (isPause) {
      cancelAnimationFrame(animated.current);
    }
  }, [changeValue, isPause]);

  const handleFIleUploadV2 = (path: string | string[]) => {
    console.log("🚀 ~ handleFileUpload ~ file:", path);
    if (!path) return;
    // setCount((perv) => perv + 1);
    setCurFilePath(path);
    invoke("read_excel", { filePath: path })
      .then((data: any) => {
        console.log("🚀 ~ .then ~ data:", data);

        const sheet = data.sheet;
        setData(sheet);
        instance.current = new RandomNumberGenerator(sheet);
        setNoUseTeam(instance.current.getNotFoundNumber());
      })
      .catch((err) => {
        // setCount((perv) => perv + 1);

        setddd(err);
      });
  };

  const updateExcel = () => {
    console.log("updateExcel", instance.current.getSheets());
    invoke("update_excel", {
      filePath: curFilePath as string,
      newSheets: instance.current.getSheets(),
    })
      .then((res) => {
        alert("更新成功");
      })
      .catch((err) => {
        alert(`更新失败${err}`);
      });
  };

  const update = (number: number) => {
    // 更改组数
    instance.current.setGroupNumber(number);
    updateExcel();
  };

  const [isShow, setShow] = useState(false);
  const [groupCount, setGroupCount] = useState(
    instance.current?.getGroupNumber || 23
  );

  return (
    <main className="w-full h-full flex flex-col justify-center  gap-8  relative ">
      {/* <div className="text-lg font-bold text-center w-full text-5xl">抽签</div> */}

      {data.length == 0 ? (
        <div className="flex justify-center items-center h-full w-full">
          <FileOpener onChange={handleFIleUploadV2} />
        </div>
      ) : (
        <>
          <div className=" absolute top-[-50px] right-[15px]">
            当前文件为：<span>{curFilePath}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className=" max-w-[80%] flex flex-col  justify-between">
              <span className="font-bold text-2xl">未抽取的组有：</span>
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-2xl text-wrap  text-ellipsis "
                  style={{
                    overflow: "hidden",
                  }}
                >
                  {noUseTeam.join(",")},
                </span>
                <span className="text-lg">
                  （共还有：{noUseTeam.length}组）
                </span>
              </div>
            </div>
            <div
              className="w-24 p-4 rounded-lg bg-lime-500 text-center "
              onClick={() => setShow(true)}
            >
              配置
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-6 w-full">
            {isAllSelected === false ? (
              <>
                <div className="w-56 h-56 text-4xl border-solid border-[2px] border-black flex justify-center items-center ">
                  {changeValue && !isPause
                    ? changeValue
                    : isPause && curRes[0]
                    ? curRes[0]
                    : "?"}
                </div>
                <div className="w-56 h-56 text-4xl border-solid border-[2px] border-black flex justify-center items-center ">
                  {changeValue && !isPause
                    ? changeValue + 2
                    : isPause && curRes[1]
                    ? curRes[1]
                    : "?"}
                </div>
                <div className="w-56 h-56 text-4xl border-solid border-[2px] border-black flex justify-center items-center ">
                  {changeValue && !isPause
                    ? changeValue + 3
                    : isPause && curRes[2]
                    ? curRes[2]
                    : "?"}
                </div>
              </>
            ) : (
              <div>已经全部选取完毕或不够下次抽取</div>
            )}
          </div>
          <footer className="w-full h-fit flex-col justify-center items-center gap-6">
            <div className="flex justify-center items-center gap-6">
              <div className="bg-orange-400 p-4 rounded-lg">
                {isPause ? (
                  <span className="w-full h-full" onClick={() => select()}>
                    开抽
                  </span>
                ) : (
                  <span className="w-full h-full" onClick={() => pause()}>
                    结束
                  </span>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-center items-center">
              <div
                className="w-40 p-4 rounded-lg bg-red-500 text-center"
                onClick={() => updateExcel()}
              >
                添加到Excel
              </div>
            </div>
          </footer>
        </>
      )}

      <Modal
        isOpen={isShow}
        onClose={() => setShow(false)}
        title="更改组名"
        onSubmit={() => update(groupCount)}
        children={
          <div className="flex flex-col gap-2">
            <label htmlFor="groupCount">
              组数：
              <input
                type="number"
                name="groupCount"
                id="groupCount"
                value={groupCount}
                onChange={(event) => setGroupCount(Number(event.target.value))}
              />
            </label>
          </div>
        }
      />
    </main>
  );
}

type sheetData = any[];

class RandomNumberGenerator {
  private numbers: number[];
  private usedNumbers: Set<number>;
  private sheet: sheetData;
  preRes: number[] = [];
  curRes: number[] = [];
  constructor(sheets: sheetData) {
    console.log("🚀 ~ RandomNumberGenerator ~ constructor ~ sheets:", sheets);
    // 已经抽的结构缓存
    const usedNumbers: number[] = [];

    // 获取已经抽到的号码
    for (let i = 2; i < sheets.length; i++) {
      const row: number[] = sheets[i];
      for (let j = 1; j < 4; j++) {
        usedNumbers.push(row[j]);
        console.log(row[j]);
      }
    }

    this.numbers = Array.from({ length: sheets[0][5] }, (_, i) => i + 1);
    this.usedNumbers = new Set(usedNumbers);

    // 去除null值
    if ((this.usedNumbers as any).has(null)) {
      (this.usedNumbers as any).delete(null);
    }
    this.sheet = sheets;
  }

  // 获取单个随机数
  public getRandomNumber(): number | null {
    if (this.usedNumbers.size === 23) {
      console.log("所有数字都已被使用");
      return null;
    }

    let randomIndex: number;
    let randomNumber: number;

    do {
      randomIndex = Math.floor(Math.random() * this.numbers.length);
      randomNumber = this.numbers[randomIndex];
    } while (this.usedNumbers.has(randomNumber));

    this.usedNumbers.add(randomNumber);
    return randomNumber;
  }

  public setGroupNumber(count: number) {
    this.numbers = Array.from({ length: count }, (_, i) => i + 1);
    this.sheet[0][5] = count;
  }

  // 所有使用过的号码清空
  public reset(): void {
    this.usedNumbers.clear();
  }

  // 还剩未抽到的号码的数量
  public getRemainingCount(): number {
    return this.numbers.length - this.usedNumbers.size;
  }
  // 获取已经抽到的号码
  public getRemarkedTeam() {
    return [...this.usedNumbers];
  }

  public getNotFoundNumber(): number[] {
    const res: number[] = [];
    console.log(this.usedNumbers);
    for (let i = 0; i <= this.numbers.length - 1; i++) {
      if (!this.usedNumbers.has(i + 1)) {
        res.push(i + 1);
      }
    }
    return res;
  }

  public getGroupNumber(): number {
    return this.numbers.length;
  }

  // 3个为一组的抽取三组
  public extractionGroups() {
    if (this.curRes.length) {
      this.preRes = this.curRes;
    }
    // 数据清空
    this.curRes.length = 0;
    if (this.getNotFoundNumber().length <= 3) {
      console.log("extractionGroups------------");

      for (let i = 0; i < 3; i++) {
        const res = this.getRandomNumber();
        console.log(
          "🚀 ~ RandomNumberGenerator ~ extractionGroups ~ res:",
          res
        );
        if (res) {
          this.curRes.push(res);
        }
      }
      const date = formatDateTable(convertExcelDate(this.sheet[0][7]));

      this.sheet.push([date, ...this.curRes]);
      return false;
    }

    for (let i = 0; i <= 2; i++) {
      const res = this.getRandomNumber();
      if (res) {
        this.curRes.push(res);
      } else {
        return false;
      }
    }
    const date = formatDateTable(convertExcelDate(this.sheet[0][7]));
    const finialRes = fillArrayToSeven([date, ...this.curRes]);
    // 将获取到结果更新到sheet
    this.sheet.push(finialRes);

    return this.curRes;
  }
  public getSheets() {
    return this.sheet;
  }
}

function formatDateTable(start: Date | string) {
  const WeeksBetweenDates = convertToChinese(
    calculateWeeksBetweenDates(start, new Date())
  );

  const day = getWeekday(new Date(), "long");

  const time = formatTime(new Date());

  return `第${WeeksBetweenDates}周、${day}、${time}`;
}

function fillArrayToSeven(arr: any[]) {
  while (arr.length < 8) {
    arr.push(null); // 可以将null替换为其他你想填充的值
  }
  return arr;
}

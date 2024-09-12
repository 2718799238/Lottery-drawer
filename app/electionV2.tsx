"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function ElectionV2() {
  const instance = useRef<any>();
  const [data, setData] = useState<any[]>([]);

  const [curRes, setCurRes] = useState<number[]>([0, 0, 0]);
  const [noUseTeam, setNoUseTeam] = useState<number[]>([]);
  const [changeValue, setChangeValue] = useState<number>(0);
  const [isPause, setPause] = useState(true);
  const [isAllSelected, setAllSelected] = useState(false);

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

  //  上传出来Excel文件
  const handleFileUpload = (e: any) => {
    const file: File = e.target.files[0];
    console.log(file);
    if (!file) return;

    file
      .arrayBuffer()
      .then((res) => {
        const arrayBuffer = res;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // 只处理第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData);
        instance.current = new RandomNumberGenerator(jsonData);
        setNoUseTeam(instance.current.getNotFoundNumber());
      })

      .catch((error) => {
        console.error("Error parsing Excel file:", error);
        setData([]);
      });
  };

  return (
    <main className="w-full flex flex-col justify-center  gap-8 row-start-2  sm:items-start">
      {/* <div className="text-lg font-bold text-center w-full text-5xl">抽签</div> */}
      <div>
        {data.length == 0 ? (
          <label htmlFor="file">
            <input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
          </label>
        ) : (
          <>
            <div>
              <span className="font-bold text-2xl">未抽取的组有：</span>
              <span className="text-2xl">{noUseTeam.join(",")}</span>
            </div>
          </>
        )}
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
            onClick={() => location.reload()}
          >
            刷新Excel数据
          </div>
        </div>
      </footer>
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
      for (let j = 1; j < row.length; j++) {
        usedNumbers.push(row[j]);
      }
    }

    this.numbers = Array.from({ length: 23 }, (_, i) => i + 1);
    this.usedNumbers = new Set(usedNumbers);
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

  // 所有使用过的号码清空
  public reset(): void {
    this.usedNumbers.clear();
  }

  // 获取已经抽到的号码的数量
  public getRemainingCount(): number {
    return 23 - this.usedNumbers.size;
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

  // 3个为一组的抽取三组
  public extractionGroups() {
    if (this.curRes.length) {
      this.preRes = this.curRes;
    }
    // 数据清空
    this.curRes.length = 0;
    for (let i = 0; i <= 2; i++) {
      const res = this.getRandomNumber();
      if (res) {
        this.curRes.push(res);
      } else {
        return false;
      }
    }
    this.sheet.push([, ...this.curRes]);

    return this.curRes;
  }

  public getSheets() {
    return this.sheet;
  }
}

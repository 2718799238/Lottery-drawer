import { useRef } from "react";
import {
  calculateWeeksBetweenDates,
  convertExcelDate,
  convertToChinese,
  formatTime,
  getWeekday,
} from "../utils";

export const useGetRandom = () => {
  const instance = useRef<RandomNumberGenerator | null>(null);

  const createInstance = (sheet: any) => {
    instance.current = new RandomNumberGenerator(sheet);
  };

  return {
    instance,
    createInstance,
  };
};

type sheetData = any[];
class RandomNumberGenerator {
  private sheet: sheetData;
  // 总组数映射表
  private numbers: number[];

  // 已经抽到的号码
  private usedNumbers: Set<number>;

  // 起始时间
  private startTime: Date;

  // 每次抽取组数
  private numberOfExtractions: number = 3;
  preRes: number[] = [];
  curRes: number[] = [];
  constructor(sheets: sheetData) {
    // 已经抽的结构缓存
    const usedNumbers: number[] = [];

    // 获取已经抽到的号码
    for (let i = 2; i < sheets.length; i++) {
      const row: number[] = sheets[i];
      for (let j = 1; j < 4; j++) {
        usedNumbers.push(row[j]);
      }
    }
    console.log(sheets);
    this.numbers = Array.from({ length: sheets[0][5] }, (_, i) => i + 1);
    this.usedNumbers = new Set(usedNumbers);

    // 去除null值
    if ((this.usedNumbers as any).has(null)) {
      (this.usedNumbers as any).delete(null);
    }
    this.sheet = sheets;

    // 获取起始时间
    this.startTime = convertExcelDate(sheets[0][7]);

    // 获取每次选举数
    this.numberOfExtractions = sheets[0][9];
  }

  public setNumberOfExtractions(num: number): number {
    this.numberOfExtractions = num;
    this.sheet[0][9] = num;
    return this.numberOfExtractions;
  }
  public getNumberOfExtractions() {
    return this.numberOfExtractions;
  }

  // 获取单个随机数
  public getRandomNumber(): number | null {
    if (this.usedNumbers.size === this.numbers.length) {
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

  //   设置总组数
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

  //   返回没有抽取到的组
  public getNotFoundGroup(): number[] {
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

  // count个为一组的抽取三组
  public extractionGroups(count: number) {
    let can = this.getNotFoundGroup().length > count;
    // 缓存上次抽奖结果然后清空curRes数组
    if (this.curRes.length) {
      this.preRes = [...this.curRes];
      // 数据清空
      this.curRes.length = 0;
    }
    // 如果小于指定要抽取到的组数，就直接返回结果
    if (can) {
      for (let i = 0; i < count; i++) {
        const res = this.getRandomNumber();
        console.log(
          "🚀 ~ RandomNumberGenerator ~ extractionGroups ~ res:",
          res
        );
        if (res) {
          this.curRes.push(res);
        } else {
          throw "没有更多数据了";
        }
      }
    } else {
      const res = this.getNotFoundGroup()!;
      this.curRes = [...res];
      res.forEach((i) => this.usedNumbers.add(i));
    }
    const date = formatDateTable(this.startTime);
    const finialRes = fillArrayToSeven([date, ...this.curRes]);
    // 将获取到结果更新到sheet
    this.sheet.push(finialRes);
    return {
      isCanContinue: can,
      result: this.curRes,
    };
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

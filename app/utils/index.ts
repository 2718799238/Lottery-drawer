import dayjs, { Dayjs } from "dayjs";

// 导入中文语言包
import "dayjs/locale/zh-cn";
// 设置 Day.js 使用中文
dayjs.locale("zh-cn");

type WeekdayFormat = "number" | "short" | "long";

/**
 * 计算两个日期之间的完整周数
 * @param startDate 开始日期（字符串、Date 对象或 Dayjs 对象）
 * @param endDate 结束日期（字符串、Date 对象或 Dayjs 对象）
 * @returns 两个日期之间的完整周数
 */
export function calculateWeeksBetweenDates(
  startDate: string | Date | Dayjs,
  endDate: string | Date | Dayjs
): number {
  // 确保开始日期不晚于结束日期
  let start = dayjs(startDate);
  let end = dayjs(endDate);

  if (start.isAfter(end)) {
    [start, end] = [end, start];
  }

  // 计算两个日期之间的天数差
  const diffInDays: number = end.diff(start, "day");

  // 计算周数并向下取整
  const weeks: number = Math.floor(diffInDays / 7) + 1;

  return weeks;
}

export function getWeekday(
  date: string | Date | dayjs.Dayjs = new Date(),
  format: WeekdayFormat = "number"
): number | string {
  const d = dayjs(date);

  switch (format) {
    case "number":
      return d.day();
    case "short":
      return d.format("ddd");
    case "long":
      return d.format("dddd");
    default:
      throw new Error("Invalid format specified");
  }
}

export function formatTime(date: Date | string) {
  return dayjs(date).format("MM.DD");
}

/**
 * 将Excel数字格式的日期时间转换为JavaScript Date对象
 * @param excelDate Excel中的数字格式日期时间
 * @param use1904Windowing 是否使用1904日期系统（默认为false，即使用1900日期系统）
 * @returns JavaScript Date对象
 */
export function convertExcelDate(
  excelDate: number,
  use1904Windowing: boolean = false
): Date {
  // Excel的日期系统起始日期
  const startDate = use1904Windowing
    ? new Date(1904, 0, 1)
    : new Date(1899, 11, 30);

  // 计算毫秒数
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const offsetDays = use1904Windowing ? excelDate : excelDate - 1; // 1900系统需要减1天
  const totalMilliseconds = offsetDays * millisecondsPerDay;

  // 创建新的日期对象
  const resultDate = new Date(startDate.getTime() + totalMilliseconds);

  return resultDate;
}

/**
 * 将英文数字转换为中文数字
 * @param num 要转换的数字（可以是数字或字符串）
 * @returns 转换后的中文数字字符串
 */
export function convertToChinese(num: number | string): string {
  const chineseNums = [
    "零",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
  ];
  const chineseUnits = ["", "十", "百", "千", "万", "亿", "兆"];

  // 处理负数
  const isNegative = typeof num === "string" ? num.startsWith("-") : num < 0;
  num = Math.abs(Number(num));

  // 处理小数
  const [integerPart, decimalPart] = num.toString().split(".");

  function convertInteger(n: string): string {
    if (n === "0") return chineseNums[0];
    let result = "";
    let prevZero = false;
    const length = n.length;

    for (let i = 0; i < length; i++) {
      const digit = parseInt(n[i]);
      const unit = length - i - 1;

      if (digit === 0) {
        if (!prevZero && i !== length - 1) {
          result += chineseNums[digit];
        }
        prevZero = true;
      } else {
        if (prevZero) {
          result += chineseNums[0];
        }
        result += chineseNums[digit] + chineseUnits[unit % 4];
        prevZero = false;
      }

      if (unit === 4 && result !== "") result += "万";
      if (unit === 8 && result !== "") result += "亿";
    }

    // 处理特殊情况："十"开头的数字
    if (result.startsWith("一十")) {
      result = result.slice(1);
    }

    return result;
  }

  let result = convertInteger(integerPart);

  // 处理小数部分
  if (decimalPart) {
    result += "点";
    for (const digit of decimalPart) {
      result += chineseNums[parseInt(digit)];
    }
  }

  // 添加负号
  if (isNegative) {
    result = "负" + result;
  }

  return result;
}

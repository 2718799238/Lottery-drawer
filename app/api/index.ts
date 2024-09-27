import { invoke } from "@tauri-apps/api";

// 文件内容更新
export const updateExcel = (curFilePath: string | string[], newSheets: any) => {
  return invoke("update_excel", {
    filePath: curFilePath as string,
    newSheets,
  });
};

export const uploadExcelFile = (filePath: string | string[]) => {
  return invoke("read_excel", { filePath });
};

export const createExcelTemplate = (
  filePath: string,
  startTime: number,
  allGroups: number,
  numberOfExtractions: number
) => {
  return invoke("generate_excel_template", {
    filePath,
    startTime,
    allGroups,
    numberOfExtractions,
  });
};

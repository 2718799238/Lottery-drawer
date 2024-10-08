import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
export const useGetOs = () => {
  const [filePath, setFilePath] = useState("");

  const handleSelectDir = async () => {
    // 在Tauri环境中运行时，使用open函数
    if ((window && (window as any)).__TAURI__) {
      const selected = (await open({
        directory: true,
        multiple: false,
      })) as string;
      setFilePath(selected);
      return selected;
    }
  };

  const handleSelectFile = async (fileType: string[]) => {
    // 在Tauri环境中运行时，使用open函数
    try {
      // 在Tauri环境中运行时，使用open函数
      if ((window as any).__TAURI__) {
        const selected = (await open({
          multiple: false,
          filters: [
            {
              name: "Text",
              extensions: fileType,
            },
          ],
        })) as string;
        if (selected) {
          setFilePath(selected);
          return selected;
        }
      } else {
        console.log("Tauri API is not available");
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  return { filePath, handleSelectDir, handleSelectFile };
};

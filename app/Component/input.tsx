import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";

interface Props {
  onChange: (path: string | string[]) => void;
}
export default function FileOpener({ onChange }: Props) {
  const [filePath, setFilePath] = useState<string | string[]>("");

  const handleOpenFile = async () => {
    try {
      // 在Tauri环境中运行时，使用open函数
      if (window.__TAURI__) {
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: "Text",
              extensions: ["xlsx", "xls"],
            },
          ],
        });
        if (selected) {
          setFilePath(selected);
          onChange(selected);
        }
      } else {
        console.log("Tauri API is not available");
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  return (
    <div>
      <button
        className=" border-solid border-[2px] border-gray-700 p-8"
        onClick={handleOpenFile}
      >
        Open File
      </button>
      {filePath && <p>Selected file: {filePath}</p>}
    </div>
  );
}

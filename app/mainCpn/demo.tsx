"use client";
import { Button, message, Divider, Modal, FormProps, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import Modal1 from "../Component/Modal";

import FileOpener from "../Component/input";
import { useChangeNumber } from "../hook/useChangeNumber";
import { createExcelTemplate, updateExcel, uploadExcelFile } from "../api";

import { useGetRandom } from "../hook/useGetRandom";

import CreateTemplateForm, { FieldType } from "./CreateTemplateForm";

import { convertToExcelDate } from "../utils";
export default function Election() {
  // 保存Excel数据
  const [data, setData] = useState<any[]>([]);

  const [noUseTeam, setNoUseTeam] = useState<number[]>([]);
  const [isAllSelected, setAllSelected] = useState(false);
  const [curFilePath, setCurFilePath] = useState<string | string[]>("");
  const { isPause, setPause, number: changeValue } = useChangeNumber(23);

  // 创建抽奖类实例
  const { instance, createInstance } = useGetRandom();

  const [currentNumberOfExtractions, setCurrentNumberOfExtractions] = useState(
    instance.current?.getNumberOfExtractions() || 0
  );

  const [curRes, setCurRes] = useState<number[]>(() =>
    Array.from(
      { length: instance.current?.getNumberOfExtractions() || 0 },
      () => 0
    )
  );
  //   开始抽签
  function select() {
    if (instance.current!.getSheets().length === 0) {
      alert("数据为空，请先添加数据");
      return;
    }
    try {
      if (instance.current) {
        const { result, isCanContinue } = instance.current.extractionGroups(
          currentNumberOfExtractions
        );
        if (isCanContinue) {
          setPause(false);
          setCurRes(() => [...result]);
        } else {
          setAllSelected(true);
          setCurRes(() => [...result]);
          messageApi.success("抽签完毕，或不够下次抽取,最终结果如下：");
          if (instance.current) {
            setNoUseTeam(instance.current.getNotFoundGroup());
          }
        }
      }
    } catch (error) {
      messageApi.error("抽签失败" + error);
    }
  }

  //   结束抽取
  function pause() {
    setPause(true);
    if (instance.current) {
      setNoUseTeam(instance.current.getNotFoundGroup());
    }
  }

  // 一键上传解析文件
  const [messageApi, contextHolder] = message.useMessage();
  const handleFIleUploadV2 = (path: string | string[]) => {
    if (!path) return;
    setCurFilePath(path);
    uploadExcelFile(path)
      .then((data: any) => {
        const sheet = data.sheet;
        setData(sheet);
        createInstance(sheet);
        if (instance.current) {
          //TODO 进行错误处理
          setNoUseTeam(instance.current.getNotFoundGroup());
          console.log(
            "每次抽取组数：" + instance.current?.getNumberOfExtractions() || 0
          );

          setGroupCount(() => instance.current?.getGroupNumber() || 0);
          // 设置当前抽取组数
          setCurrentNumberOfExtractions(
            instance.current?.getNumberOfExtractions()
          );
          // 设置初始状态
          setCurRes(() =>
            Array.from(
              { length: instance.current?.getNumberOfExtractions() || 0 },
              () => 0
            )
          );
        }
        messageApi.success("上传解析成功");
      })
      .catch((err) => {
        messageApi.error("上传解析失败" + err);
      });
  };

  // 更改组数或更新抽签数
  const updateGroup = (groupNumber: number, NumberOfExtractions: number) => {
    instance.current!.setGroupNumber(groupNumber);
    instance.current!.setNumberOfExtractions(NumberOfExtractions);
    update();
  };

  // 数据更新函数入口
  const update = () => {
    console.log("数据更新", instance.current?.getSheets());
    updateExcel(curFilePath, instance.current!.getSheets())
      .then((res) => {
        messageApi.success("数据更新到Excel成功");
      })
      .catch((err) => {
        messageApi.error("数据更新到Excel失败" + err);
      });
  };

  // 配置弹窗显示
  const [isShow, setShow] = useState(false);
  const [groupCount, setGroupCount] = useState(
    instance.current?.getGroupNumber || 23
  );

  useEffect(() => {
    setCurRes(() =>
      Array.from({ length: currentNumberOfExtractions }, (_) => 0)
    );
  }, [currentNumberOfExtractions]);

  const [open, setOpen] = useState(false);

  // 生成模板
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      const targetFilePath = values.dirPath + "\\" + values.filename + ".xlsx";
      const time = convertToExcelDate(values.startTime);
      const res = await createExcelTemplate(
        targetFilePath,
        time,
        Number(values.allGroups),
        Number(values.numberOfExtractions)
      );
      setOpen2(true);
      if (res && typeof res === "string") {
        setCurFilePath(() => res);
      }
    } catch (e) {
      console.log("Failed:", e);
      messageApi.open({
        type: "error",
        content: "创建失败" + e,
      });
    }
  };

  //
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
    messageApi.error("创建模板失败" + errorInfo);
  };
  const [open2, setOpen2] = useState(false);
  const handlePopup = (curFilePath: string | string[]) => {
    handleFIleUploadV2(curFilePath);
    setOpen2(false);
    setTimeout(() => {
      setOpen(false);
    }, 400);
  };
  return (
    <main className="w-full h-full flex flex-col justify-center  gap-8  relative ">
      {/* <div className="text-lg font-bold text-center w-full text-5xl">抽签</div> */}
      {contextHolder}
      {data.length == 0 ? (
        <div className="flex flex-col justify-center items-center h-full w-full">
          <FileOpener onChange={handleFIleUploadV2} />
          <Divider />
          <div className="mt-5">
            <Button onClick={() => setOpen(true)}>生成模板</Button>
          </div>
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
            {curRes.map((item, index) => {
              return (
                <div
                  key={index}
                  className="w-56 h-56 text-4xl border-solid border-[2px] border-black flex justify-center items-center "
                >
                  {changeValue && !isPause
                    ? changeValue
                    : isPause && item
                    ? item
                    : "?"}
                </div>
              );
            })}
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
                onClick={() => update()}
              >
                添加到Excel
              </div>
            </div>
          </footer>
        </>
      )}

      <Modal1
        isOpen={isShow}
        onClose={() => setShow(false)}
        title="更改组名"
        onSubmit={() => updateGroup(groupCount, currentNumberOfExtractions)}
        children={
          <div className="flex flex-col gap-2">
            <label htmlFor="groupCount" className="flex items-center">
              <span className=" w-56">总小组数：</span>
              <input
                className=" w-full"
                type="number"
                name="groupCount"
                id="groupCount"
                value={groupCount}
                onChange={(event) => setGroupCount(Number(event.target.value))}
              />
            </label>
            <label htmlFor="groupCount" className=" flex items-center">
              <span className=" w-56">每抽取数：</span>
              <input
                type="number"
                name="groupCount"
                id="groupCount"
                className=" w-full"
                value={currentNumberOfExtractions}
                onChange={(event) =>
                  setCurrentNumberOfExtractions(Number(event.target.value))
                }
              />
            </label>
          </div>
        }
      />
      <Modal
        title="生成Excel模板"
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <div className=" w-full flex justify-center items-center">
          <CreateTemplateForm
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            onCancel={() => setOpen(false)}
            submitBtn={
              <Popconfirm
                title="生成完毕，是否导入"
                okText="导入"
                cancelText="取消"
                onCancel={() => setOpen2(false)}
                open={open2}
                onConfirm={() => handlePopup(curFilePath)}
              >
                生成
              </Popconfirm>
            }
          />
        </div>
      </Modal>
    </main>
  );
}

import { Button, DatePicker, Form, FormProps, Input, Tooltip } from "antd";
import { useGetOs } from "../hook/useGetDir";
import { FolderHeart } from "lucide-react";
import React from "react";
export type FieldType = {
  filename: string;
  dirPath: string;
  startTime: number;
  numberOfExtractions: number;
  allGroups: number;
};

type Props = {
  onFinish: (values: FieldType) => void;
  onFinishFailed: (errorInfo: any) => void;
  onCancel: () => void;
  submitBtn: React.ReactNode;
};

// 默认提交按钮
const defaultSubmitBtn = <>提交</>;

// 默认值
const defaultValues: Omit<FieldType, "startTime" | "dirPath"> = {
  filename: "template",
  numberOfExtractions: 23,
  allGroups: 3,
};

const CreateTemplateForm: React.FC<Props> = ({
  onFinish,
  onFinishFailed,
  onCancel,
  submitBtn = defaultSubmitBtn,
}) => {
  const [form] = Form.useForm();

  const { filePath, handleSelectDir } = useGetOs();
  const handleDir = async () => {
    const dirPath = await handleSelectDir();
    form.setFieldsValue({ dirPath });
  };
  return (
    <Form
      form={form}
      autoFocus
      name="basic"
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 800 }}
      initialValues={defaultValues}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item<FieldType>
        label="文件名称"
        name="filename"
        rules={[{ required: true, message: "请输入文件名称!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="存放文件夹路径"
        name="dirPath"
        rules={[{ required: true, message: "请输入文件夹路径!" }]}
      >
        <div
          onClick={() => handleDir()}
          className="px-2 py-1 w-[138px] h-8 rounded-md border-[1px] border-gray-200 border-solid flex justify-center items-center text-gray-400"
        >
          {filePath ? (
            <Tooltip placement="topLeft" title={filePath}>
              <span className="w-full truncate">{filePath}</span>
            </Tooltip>
          ) : (
            <>
              点击获取！
              <FolderHeart width={20} height={20} className="ml-2" />
            </>
          )}
        </div>
      </Form.Item>
      <Form.Item<FieldType>
        label="学期起始时间"
        name="startTime"
        rules={[{ required: true, message: "请输入学期起始时间" }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item<FieldType>
        label="总组数"
        name="allGroups"
        rules={[{ required: true, message: "请输入总组数" }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item<FieldType>
        label="每次抽取数"
        name="numberOfExtractions"
        rules={[{ required: true, message: "请输入每次抽取数" }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="default" htmlType="button" onClick={() => onCancel()}>
          取消
        </Button>
        <Button style={{ marginLeft: 20 }} type="primary" htmlType="submit">
          {submitBtn}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateTemplateForm;

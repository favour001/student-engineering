"use client";

import React, { CSSProperties, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

import { resolveAssetUrl, uploadFile } from "@/utils/upload";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      编辑器加载中...
    </div>
  ),
}) as any;

type RichTextEditorProps = {
  label: string;
  value?: string | null;
  folder: string;
  minHeight?: number;
  onChange: (value: string) => void;
};

export function RichTextEditor({
  label,
  value,
  folder,
  minHeight = 350,
  onChange,
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null);
  const editorStyle = { "--editor-height": `${minHeight}px` } as CSSProperties;

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "link", "image"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            const input = document.createElement("input");

            input.type = "file";
            input.accept = "image/*";
            input.click();
            input.onchange = async () => {
              const file = input.files?.[0];

              if (!file) {
                return;
              }

              try {
                const result = await uploadFile(file, folder);
                const editor = quillRef.current?.getEditor();

                if (!editor) {
                  return;
                }
                const range = editor.getSelection(true);

                editor.insertEmbed(
                  range?.index ?? editor.getLength(),
                  "image",
                  resolveAssetUrl(result.url),
                );
              } catch (error) {
                alert(error instanceof Error ? error.message : "图片上传失败");
              }
            };
          },
        },
      },
    }),
    [folder],
  );

  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div
        className="rich-text-editor-shell rounded-[22px] border border-slate-200 bg-white shadow-sm"
        style={editorStyle}
      >
        <ReactQuill
          ref={quillRef}
          modules={modules}
          theme="snow"
          value={value || ""}
          onChange={onChange}
        />
      </div>
      <p className="text-xs text-slate-400">
        编辑区内部滚动，工具栏保持在顶部。
      </p>
    </div>
  );
}

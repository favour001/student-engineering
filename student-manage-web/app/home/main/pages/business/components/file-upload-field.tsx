"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button, Input } from "@heroui/react";
import {
  ExternalLink,
  FileImage,
  Image as ImageIcon,
  Link2,
  UploadCloud,
} from "lucide-react";

import { resolveAssetUrl, uploadFile } from "@/utils/upload";

const MAX_IMAGE_UPLOAD_SIZE = 520 * 1024;
export const IMAGE_UPLOAD_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const IMAGE_UPLOAD_ACCEPT_LABEL = "JPG、PNG、WebP";

export function fileMatchesAccept(file: File, accept: string) {
  if (!accept || accept === "*/*") {
    return true;
  }

  const acceptItems = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (acceptItems.length === 0) {
    return true;
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return acceptItems.some((item) => {
    if (item.startsWith(".")) {
      return fileName.endsWith(item);
    }

    if (item.endsWith("/*")) {
      return fileType.startsWith(item.slice(0, -1));
    }

    return fileType === item;
  });
}

type FileUploadFieldProps = {
  label: string;
  value?: string | null;
  folder: string;
  accept?: string;
  onChange: (value: string) => void;
};

export function FileUploadField({
  label,
  value,
  folder,
  accept = "*/*",
  onChange,
}: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const isImageField = useMemo(() => {
    if (accept.includes("image")) {
      return true;
    }

    const lowerValue = (value || "").toLowerCase();

    return (
      /(^|\/)(image|avatar|cover|background|banner|photo)/.test(
        folder.toLowerCase(),
      ) ||
      /image|avatar|cover|background|banner|photo/.test(label.toLowerCase()) ||
      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(lowerValue)
    );
  }, [accept, folder, label, value]);
  const previewUrl = value ? resolveAssetUrl(value) : "";
  const fileName = useMemo(() => {
    if (!value) {
      return "";
    }

    return value.split("/").filter(Boolean).pop() || value;
  }, [value]);

  const handleSelectFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isSelectedImage =
      file.type.startsWith("image/") || accept.includes("image");
    if (!fileMatchesAccept(file, accept)) {
      alert(
        isSelectedImage
          ? `请选择${IMAGE_UPLOAD_ACCEPT_LABEL}格式的图片。`
          : "请选择符合要求格式的文件。",
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (isSelectedImage && file.size > MAX_IMAGE_UPLOAD_SIZE) {
      alert("图片大小请控制在 500KB 左右，过大的图片会明显影响小程序加载速度。");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFile(file, folder);

      onChange(result.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "上传失败，请稍后重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/65 p-4 md:grid-cols-[220px_1fr]">
        <div className="overflow-hidden rounded-[22px] border border-dashed border-slate-300 bg-white shadow-sm">
          {value && isImageField ? (
            <div className="relative flex h-[220px] items-center justify-center bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.8))] p-3">
              <Image
                fill
                unoptimized
                alt={label}
                className="max-h-full w-auto max-w-full rounded-xl object-contain"
                sizes="220px"
                src={previewUrl}
              />
            </div>
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_45%),linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.85))] px-5 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                {isImageField ? (
                  <ImageIcon className="size-5" />
                ) : (
                  <FileImage className="size-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {isImageField
                    ? "上传后可在这里预览图片"
                    : "上传后显示文件信息"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {isImageField
                    ? `支持${IMAGE_UPLOAD_ACCEPT_LABEL}，大小控制在 500KB 左右。`
                    : "支持手动粘贴文件地址。"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">{label}</p>
            {!isImageField ? (
              <Input
                placeholder="请输入文件地址"
                value={value || ""}
                onChange={(event) => onChange(event.target.value)}
              />
            ) : (
              <p className="text-xs text-slate-400">
                上传后会自动写入图片地址。仅支持{IMAGE_UPLOAD_ACCEPT_LABEL}，图片大小超过约
                500KB 时会被拦截。
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              accept={accept}
              className="hidden"
              type="file"
              onChange={handleSelectFile}
            />
            <Button
              color="primary"
              isLoading={uploading}
              startContent={
                !uploading ? <UploadCloud className="size-4" /> : null
              }
              variant="flat"
              onPress={() => fileInputRef.current?.click()}
            >
              上传文件
            </Button>
            {value ? (
              <Button
                as="a"
                href={previewUrl}
                rel="noreferrer"
                startContent={<ExternalLink className="size-4" />}
                target="_blank"
                variant="light"
              >
                新窗口预览
              </Button>
            ) : null}
          </div>

          {!isImageField ? (
            <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-sm text-slate-500 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Link2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-700">
                    {fileName || "还没有选择文件"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    {value || "上传完成后会自动写入文件地址。"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

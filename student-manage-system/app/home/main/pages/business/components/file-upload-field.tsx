"use client"

import React, { useMemo, useRef, useState } from "react"
import { Button, Input } from "@heroui/react"
import { ExternalLink, FileImage, Image as ImageIcon, Link2, UploadCloud } from "lucide-react"
import { resolveAssetUrl, uploadFile } from "@/utils/upload"

type FileUploadFieldProps = {
  label: string
  value?: string | null
  folder: string
  accept?: string
  onChange: (value: string) => void
}

export function FileUploadField({
  label,
  value,
  folder,
  accept = "*/*",
  onChange,
}: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const isImageField = useMemo(() => {
    if (accept.includes("image")) {
      return true
    }

    const lowerValue = (value || "").toLowerCase()
    return /(^|\/)(image|avatar|cover|background|banner|photo)/.test(folder.toLowerCase()) ||
      /image|avatar|cover|background|banner|photo/.test(label.toLowerCase()) ||
      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(lowerValue)
  }, [accept, folder, label, value])
  const previewUrl = value ? resolveAssetUrl(value) : ""
  const fileName = useMemo(() => {
    if (!value) {
      return ""
    }

    return value.split("/").filter(Boolean).pop() || value
  }, [value])

  const handleSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)

    try {
      const result = await uploadFile(file, folder)
      onChange(result.url)
    } catch (error) {
      alert(error instanceof Error ? error.message : "上传失败，请稍后重试")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/65 p-4 md:grid-cols-[220px_1fr]">
        <div className="overflow-hidden rounded-[22px] border border-dashed border-slate-300 bg-white shadow-sm">
          {value && isImageField ? (
            <div className="flex h-[220px] items-center justify-center bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.8))] p-3">
              <img
                src={previewUrl}
                alt={label}
                className="max-h-full w-auto max-w-full rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_45%),linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.85))] px-5 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                {isImageField ? <ImageIcon className="size-5" /> : <FileImage className="size-5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {isImageField ? "上传后可在这里预览图片" : "上传后显示文件信息"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {isImageField ? "建议使用清晰、较小尺寸的图片。" : "支持手动粘贴文件地址。"}
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
                上传后会自动写入图片地址，当前字段不再显示冗余路径输入框。
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleSelectFile}
            />
            <Button
              variant="flat"
              color="primary"
              isLoading={uploading}
              startContent={!uploading ? <UploadCloud className="size-4" /> : null}
              onPress={() => fileInputRef.current?.click()}
            >
              上传文件
            </Button>
            {value ? (
              <Button
                as="a"
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                variant="light"
                startContent={<ExternalLink className="size-4" />}
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
                  <p className="font-medium text-slate-700">{fileName || "还没有选择文件"}</p>
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
  )
}

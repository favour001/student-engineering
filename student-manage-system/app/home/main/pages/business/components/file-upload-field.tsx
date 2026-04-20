"use client"

import React, { useRef, useState } from "react"
import { Button, Input } from "@heroui/react"
import { UploadCloud } from "lucide-react"
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
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <Input
          label={label}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleSelectFile}
          />
          <Button
            variant="flat"
            isLoading={uploading}
            startContent={!uploading ? <UploadCloud className="size-4" /> : null}
            onPress={() => fileInputRef.current?.click()}
          >
            上传文件
          </Button>
        </div>
      </div>

      {value ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <a
            href={resolveAssetUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sky-600 underline underline-offset-2"
          >
            预览已上传文件
          </a>
          {accept.includes("image") ? (
            <img
              src={resolveAssetUrl(value)}
              alt={label}
              className="mt-3 max-h-48 rounded-xl border border-slate-200 object-cover"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

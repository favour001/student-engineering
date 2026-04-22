import Cookies from "js-cookie"

const getBackendUrl = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8888").replace(/\/+$/, "")
const getBackendApiUrl = () => {
  const backendUrl = getBackendUrl()
  return backendUrl.endsWith("/api") ? backendUrl : `${backendUrl}/api`
}
const getFilePublicPrefix = () => process.env.NEXT_PUBLIC_FILE_PUBLIC_PREFIX || "/image"
const getLegacyPreviewPath = () =>
  process.env.NEXT_PUBLIC_LEGACY_FILE_PREVIEW_PATH || "/api/files/legacy-preview"

export interface UploadedFileResult {
  originalName: string
  fileName: string
  mimeType: string
  size: number
  filePath: string
  storagePath: string
  url: string
  previewUrl: string
  downloadUrl: string
  isImage: boolean
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) {
    return ""
  }

  if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) {
    return value
  }

  if (value.startsWith("/files/")) {
    return `${getBackendApiUrl()}${value}`
  }

  if (value.startsWith("/image/")) {
    return value
  }

  if (value.startsWith("/uploads/")) {
    return `${getBackendUrl()}${value}`
  }

  if (value.startsWith(getFilePublicPrefix())) {
    return value
  }

  if (value.startsWith("/home/")) {
    return `${getBackendUrl()}${getLegacyPreviewPath()}?path=${encodeURIComponent(value)}`
  }

  if (!value.startsWith("/")) {
    return `${getBackendUrl()}${getFilePublicPrefix()}/${value}`
  }

  return `${getBackendUrl()}${value.startsWith("/") ? value : `/${value}`}`
}

export async function uploadFile(file: File, folder = "common"): Promise<UploadedFileResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)

  const accessToken = Cookies.get("access_token")
  const response = await fetch(`${getBackendApiUrl()}/files/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.message || payload?.error || "文件上传失败"
    throw new Error(message)
  }

  const payload = await response.json()
  return payload?.data ?? payload
}

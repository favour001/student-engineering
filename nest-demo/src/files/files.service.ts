import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type StoredFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
};

const DEFAULT_STORAGE_DIRNAME = 'file_storage';
const DEFAULT_PUBLIC_PREFIX = '/file-storage';
const LEGACY_PUBLIC_PREFIX = '/uploads';
const DEFAULT_LEGACY_ASSET_SERVER = 'https://43.139.231.122:8888';
const DEFAULT_LEGACY_FILE_ROOT = '/home/project';

function trimTrailingSlash(value: string) {
  return value.replace(/[\\/]+$/, '');
}

function ensureLeadingSlash(value: string) {
  return value.startsWith('/') ? value : `/${value}`;
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, '');
}

export function getFileStorageRoot() {
  const configuredRoot = process.env.FILE_STORAGE_ROOT?.trim();
  return configuredRoot
    ? path.resolve(configuredRoot)
    : path.resolve(process.cwd(), DEFAULT_STORAGE_DIRNAME);
}

export function getFileStoragePublicPrefix() {
  const configuredPrefix = process.env.FILE_STORAGE_PUBLIC_PREFIX?.trim();
  return ensureLeadingSlash(trimTrailingSlash(configuredPrefix || DEFAULT_PUBLIC_PREFIX));
}

export function getLegacyAssetServer() {
  return trimTrailingSlash(
    process.env.LEGACY_ASSET_SERVER?.trim() || DEFAULT_LEGACY_ASSET_SERVER,
  );
}

export function getLegacyFileRoot() {
  return trimTrailingSlash(
    process.env.LEGACY_FILE_ROOT?.trim() || DEFAULT_LEGACY_FILE_ROOT,
  );
}

function stripKnownPublicPrefixes(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const knownPrefixes = [getFileStoragePublicPrefix(), LEGACY_PUBLIC_PREFIX];

  for (const prefix of knownPrefixes) {
    if (normalizedPath === prefix) {
      return '';
    }

    if (normalizedPath.startsWith(`${prefix}/`)) {
      return normalizedPath.slice(prefix.length + 1);
    }
  }

  return normalizedPath.replace(/^\/+/, '');
}

@Injectable()
export class FilesService {
  readonly uploadRoot = getFileStorageRoot();

  ensureUploadRoot() {
    fs.mkdirSync(this.uploadRoot, { recursive: true });
  }

  createTargetFolder(folder?: string) {
    const now = new Date();
    const segments = [
      this.normalizeFolderName(folder),
      now.getFullYear().toString(),
      `${now.getMonth() + 1}`.padStart(2, '0'),
      `${now.getDate()}`.padStart(2, '0'),
    ];
    const absoluteDir = path.join(this.uploadRoot, ...segments);
    fs.mkdirSync(absoluteDir, { recursive: true });

    return {
      absoluteDir,
      relativeDir: segments.join('/'),
    };
  }

  buildStoredFileName(originalName: string) {
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const sanitizedBaseName =
      baseName
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48) || 'file';

    return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}-${sanitizedBaseName}${extension}`;
  }

  buildFileResponse(file: StoredFile, storedPath: string) {
    const normalizedPath = storedPath.replace(/\\/g, '/');
    const publicUrl = `${getFileStoragePublicPrefix()}/${normalizedPath}`;

    return {
      originalName: file.originalname,
      fileName: path.basename(normalizedPath),
      mimeType: file.mimetype,
      size: file.size,
      storagePath: normalizedPath,
      url: publicUrl,
      previewUrl: `/files/preview?path=${encodeURIComponent(normalizedPath)}`,
      downloadUrl: `/files/download?path=${encodeURIComponent(normalizedPath)}`,
      isImage: file.mimetype.startsWith('image/'),
    };
  }

  resolveStoredFile(filePath: string) {
    if (!filePath) {
      throw new BadRequestException('缺少文件路径');
    }

    const normalizedPath = stripKnownPublicPrefixes(filePath);
    const absolutePath = path.resolve(this.uploadRoot, normalizedPath);

    if (!absolutePath.startsWith(this.uploadRoot)) {
      throw new BadRequestException('非法文件路径');
    }

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      throw new NotFoundException('文件不存在');
    }

    return {
      absolutePath,
      normalizedPath,
      fileName: path.basename(absolutePath),
    };
  }

  resolveLegacyFilePath(filePath: string) {
    if (!filePath) {
      throw new BadRequestException('缺少文件路径');
    }

    const normalizedPath = filePath.replace(/\\/g, '/').trim();
    if (!normalizedPath) {
      throw new BadRequestException('缺少文件路径');
    }

    if (normalizedPath.startsWith('/home/')) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith('/image/')) {
      return `${getLegacyFileRoot()}/${trimLeadingSlash(normalizedPath)}`;
    }

    throw new BadRequestException('仅支持 /image 或 /home 开头的历史文件路径');
  }

  buildLegacyDownloadUrl(filePath: string) {
    const absolutePath = this.resolveLegacyFilePath(filePath);
    return `${getLegacyAssetServer()}/download?filename=${encodeURIComponent(absolutePath)}`;
  }

  private normalizeFolderName(folder?: string) {
    if (!folder) {
      return 'common';
    }

    const normalized = folder
      .split(/[\\/]+/)
      .map((segment) => segment.trim().replace(/[^a-zA-Z0-9-_]/g, '-'))
      .filter(Boolean)
      .slice(0, 3)
      .join('/');

    return normalized || 'common';
  }
}

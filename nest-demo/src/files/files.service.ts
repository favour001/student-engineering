import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { createHash, randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileStorage } from './entities/file-storage.entity';
import { UploadedDiskFile } from './files.types';

type StoredFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
};

const DEFAULT_STORAGE_DIRNAME = 'file_storage';
const DEFAULT_PUBLIC_PREFIX = '/image';
const LEGACY_PUBLIC_PREFIX = '/uploads';
const DEFAULT_LEGACY_ASSET_SERVER = 'https://43.139.231.122:8888';
const DEFAULT_LEGACY_FILE_ROOT = '/home/project';
const DEFAULT_LEGACY_ASSET_TIMEOUT = 15000;
const DEFAULT_STORAGE_WAY = 'LOCAL';
const DEFAULT_STORAGE_REGION = 'image';
const DEFAULT_BUCKET = 'image';
const DEFAULT_APPLICATION = 'nest-demo';

function trimTrailingSlash(value: string) {
  return value.replace(/[\\/]+$/, '');
}

function ensureLeadingSlash(value: string) {
  return value.startsWith('/') ? value : `/${value}`;
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, '');
}

function normalizeFolderName(folder?: string) {
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

export function createTargetFolder(folder?: string) {
  const now = new Date();
  const uploadRoot = getFileStorageRoot();
  const segments = [
    normalizeFolderName(folder),
    now.getFullYear().toString(),
    `${now.getMonth() + 1}`.padStart(2, '0'),
    `${now.getDate()}`.padStart(2, '0'),
  ];
  const absoluteDir = path.join(uploadRoot, ...segments);
  fs.mkdirSync(absoluteDir, { recursive: true });

  return {
    absoluteDir,
    relativeDir: segments.join('/'),
  };
}

export function buildStoredFileName(originalName: string) {
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

export function getLegacyAssetTimeoutMs() {
  const configuredTimeout = Number(process.env.LEGACY_ASSET_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_LEGACY_ASSET_TIMEOUT;
}

export function shouldRejectLegacyAssetUnauthorized() {
  const configuredValue = process.env.LEGACY_ASSET_REJECT_UNAUTHORIZED?.trim();
  if (!configuredValue) {
    return false;
  }

  return configuredValue.toLowerCase() !== 'false';
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
  constructor(
    @InjectRepository(FileStorage)
    private readonly fileStorageRepository: Repository<FileStorage>,
  ) {}

  readonly uploadRoot = getFileStorageRoot();

  ensureUploadRoot() {
    fs.mkdirSync(this.uploadRoot, { recursive: true });
  }

  createTargetFolder(folder?: string) {
    return createTargetFolder(folder);
  }

  buildStoredFileName(originalName: string) {
    return buildStoredFileName(originalName);
  }

  buildFileResponse(file: StoredFile, storedPath: string) {
    const normalizedPath = storedPath.replace(/\\/g, '/');
    const publicUrl = `${getFileStoragePublicPrefix()}/${normalizedPath}`;
    const absolutePath = path.join(this.uploadRoot, normalizedPath).replace(/\\/g, '/');

    return {
      originalName: file.originalname,
      fileName: path.basename(normalizedPath),
      mimeType: file.mimetype,
      size: file.size,
      filePath: absolutePath,
      storagePath: normalizedPath,
      url: publicUrl,
      previewUrl: publicUrl,
      downloadUrl: publicUrl,
      isImage: file.mimetype.startsWith('image/'),
    };
  }

  async saveUploadedFile(
    file: UploadedDiskFile,
    storedPath: string,
    folder?: string,
  ) {
    const response = this.buildFileResponse(file, storedPath);

    await this.fileStorageRepository.save(
      this.fileStorageRepository.create({
        fileKey: randomUUID().replace(/-/g, ''),
        originalFileName: file.originalname,
        hashVal: this.buildFileHash(response.filePath, file),
        fileType: this.resolveFileType(file.mimetype),
        filePath: response.filePath,
        fileSize: file.size.toString(),
        fileExt: path.extname(file.originalname).replace(/^\./, '').slice(0, 32) || null,
        contentType: file.mimetype.slice(0, 32) || null,
        storeWay: DEFAULT_STORAGE_WAY,
        storeRegion: DEFAULT_STORAGE_REGION,
        isTemp: '0',
        dbPath: this.buildDbPath(folder),
        env: process.env.NODE_ENV?.slice(0, 32) || 'development',
        application:
          process.env.FILE_STORAGE_APPLICATION?.slice(0, 32) || DEFAULT_APPLICATION,
        bucket: DEFAULT_BUCKET,
      }),
    );

    return response;
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

  createLegacyAssetRequest(filePath: string) {
    const targetUrl = new URL(this.buildLegacyDownloadUrl(filePath));
    const isHttps = targetUrl.protocol === 'https:';

    return {
      targetUrl,
      requestImpl: isHttps ? https : http,
      requestOptions: {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (isHttps ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: 'GET',
        timeout: getLegacyAssetTimeoutMs(),
        rejectUnauthorized: isHttps ? shouldRejectLegacyAssetUnauthorized() : undefined,
      },
    };
  }

  private normalizeFolderName(folder?: string) {
    if (!folder) {
      return 'common';
    }

    return normalizeFolderName(folder);
  }

  private resolveFileType(mimetype: string) {
    if (mimetype.startsWith('image/')) {
      return 'IMG';
    }

    if (mimetype.startsWith('audio/')) {
      return 'AUDIO';
    }

    if (mimetype.startsWith('video/')) {
      return 'VIDEO';
    }

    return 'DOC';
  }

  private buildDbPath(folder?: string) {
    return `business/file/${this.normalizeFolderName(folder)}`.slice(0, 32);
  }

  private buildFileHash(absolutePath: string, file: StoredFile) {
    try {
      const content = fs.readFileSync(absolutePath);
      return createHash('md5').update(content).digest('hex');
    } catch {
      return createHash('md5')
        .update(`${file.originalname}:${file.size}:${file.mimetype}`)
        .digest('hex');
    }
  }
}

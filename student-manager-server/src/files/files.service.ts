import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
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
const UPLOADS_PUBLIC_PREFIX = '/uploads';
const DEFAULT_STORAGE_WAY = 'LOCAL';
const DEFAULT_STORAGE_REGION = 'image';
const DEFAULT_BUCKET = 'image';
const DEFAULT_APPLICATION = 'nest-demo';
const DEFAULT_SFTP_TIMEOUT = 30000;
const IMAGE_THUMBNAIL_DIRNAME = 'thumbnails';
const SUPPORTED_OPTIMIZE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const IMAGE_THUMBNAIL_VARIANTS = [
  { width: 160, quality: 75 },
  { width: 320, quality: 76 },
  { width: 750, quality: 78 },
  { width: 1080, quality: 82 },
];

function trimTrailingSlash(value: string) {
  return value.replace(/[\\/]+$/, '');
}

function ensureLeadingSlash(value: string) {
  return value.startsWith('/') ? value : `/${value}`;
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, '');
}

function trimRemoteSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function toRemotePath(...segments: string[]) {
  return segments
    .map((segment, index) =>
      index === 0 ? trimRemoteSlash(segment) : segment.replace(/^\/+|\/+$/g, ''),
    )
    .filter(Boolean)
    .join('/');
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

function resolveExtensionFromMimeType(mimeType?: string) {
  const normalizedMimeType = mimeType?.toLowerCase().split(';')[0].trim();

  switch (normalizedMimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/bmp':
      return '.bmp';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '';
  }
}

export function buildStoredFileName(originalName: string, mimeType?: string) {
  const normalizedOriginalName = normalizeOriginalFileName(originalName);
  const extension = path.extname(normalizedOriginalName) || resolveExtensionFromMimeType(mimeType);
  const baseName = path.basename(normalizedOriginalName, extension);
  const sanitizedBaseName =
    baseName
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'file';

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}-${sanitizedBaseName}${extension}`;
}

export function normalizeOriginalFileName(originalName: string) {
  if (!originalName) {
    return originalName;
  }

  const decodedName = Buffer.from(originalName, 'latin1').toString('utf8');

  if (!decodedName || decodedName.includes('�') || decodedName === originalName) {
    return originalName;
  }

  const looksLikeMojibake = /[ÃÂÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(
    originalName,
  );
  const decodedLooksReadable = /[\u3400-\u9fff]/.test(decodedName);

  return looksLikeMojibake || decodedLooksReadable ? decodedName : originalName;
}

function stripKnownPublicPrefixes(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const knownPrefixes = [getFileStoragePublicPrefix(), UPLOADS_PUBLIC_PREFIX];

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

function getSftpConfig() {
  const enabled = process.env.FILE_STORAGE_SFTP_ENABLED?.trim().toLowerCase();

  if (!['1', 'true', 'yes', 'on'].includes(enabled || '')) {
    return null;
  }

  const host = process.env.FILE_STORAGE_SFTP_HOST?.trim();
  const user = process.env.FILE_STORAGE_SFTP_USER?.trim();
  const remoteRoot = process.env.FILE_STORAGE_SFTP_REMOTE_ROOT?.trim();

  if (!host || !user || !remoteRoot) {
    throw new BadRequestException(
      '已启用文件 SFTP 同步，但缺少 FILE_STORAGE_SFTP_HOST、FILE_STORAGE_SFTP_USER 或 FILE_STORAGE_SFTP_REMOTE_ROOT',
    );
  }

  const port = process.env.FILE_STORAGE_SFTP_PORT?.trim() || '22';
  const keyPath = process.env.FILE_STORAGE_SFTP_KEY_PATH?.trim();
  const timeoutMs = Number(process.env.FILE_STORAGE_SFTP_TIMEOUT_MS);

  return {
    host,
    user,
    remoteRoot: trimRemoteSlash(remoteRoot),
    port,
    keyPath,
    timeoutMs:
      Number.isFinite(timeoutMs) && timeoutMs > 0
        ? timeoutMs
        : DEFAULT_SFTP_TIMEOUT,
  };
}

function runSftpCommand(command: string, args: string[], timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const stderr: Buffer[] = [];
    const stdout: Buffer[] = [];
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`${command} 执行超时`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);

      if (code === 0) {
        resolve();
        return;
      }

      const output = Buffer.concat(stderr).toString() || Buffer.concat(stdout).toString();
      reject(new Error(`${command} 退出码 ${code}${output ? `: ${output}` : ''}`));
    });
  });
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
    const normalizedFile = {
      ...file,
      originalname: normalizeOriginalFileName(file.originalname),
    };
    const response = this.buildFileResponse(normalizedFile, storedPath);
    const syncedFilePath = await this.syncFileToSftpIfEnabled(
      response.filePath,
      response.storagePath,
    );
    await this.generateImageThumbnails(response.filePath, response.storagePath);
    const returnedResponse = syncedFilePath
      ? {
          ...response,
          filePath: syncedFilePath,
        }
      : response;

    await this.fileStorageRepository.save(
      this.fileStorageRepository.create({
        fileKey: randomUUID().replace(/-/g, ''),
        originalFileName: normalizedFile.originalname,
        hashVal: this.buildFileHash(response.filePath, normalizedFile),
        fileType: this.resolveFileType(file.mimetype),
        filePath: syncedFilePath || response.filePath,
        fileSize: file.size.toString(),
        fileExt: path.extname(normalizedFile.originalname).replace(/^\./, '').slice(0, 32) || null,
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

    return returnedResponse;
  }

  private async generateImageThumbnails(absolutePath: string, storagePath: string) {
    const extension = path.extname(absolutePath).toLowerCase();

    if (!SUPPORTED_OPTIMIZE_EXTENSIONS.has(extension) || !fs.existsSync(absolutePath)) {
      return;
    }

    const sharp = this.loadSharp();
    if (!sharp) {
      return;
    }

    for (const variant of IMAGE_THUMBNAIL_VARIANTS) {
      const thumbnailPath = this.buildOptimizedImageThumbnailPath(
        storagePath,
        variant.width,
        variant.quality,
      );

      if (fs.existsSync(thumbnailPath) && fs.statSync(thumbnailPath).isFile()) {
        await this.syncThumbnailToSftpIfEnabled(thumbnailPath, storagePath, variant);
        continue;
      }

      fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });

      try {
        await this.writeOptimizedImage(sharp, absolutePath, thumbnailPath, extension, variant);
        await this.syncThumbnailToSftpIfEnabled(thumbnailPath, storagePath, variant);
      } catch {
        // 上传主流程不能因为缩略图失败而失败，缺失规格后续访问时仍可按需生成。
      }
    }
  }

  private async syncThumbnailToSftpIfEnabled(
    thumbnailPath: string,
    storagePath: string,
    variant: { width: number; quality: number },
  ) {
    const thumbnailStoragePath = [
      IMAGE_THUMBNAIL_DIRNAME,
      `w${variant.width}-q${variant.quality}`,
      storagePath.replace(/\\/g, '/'),
    ].join('/');

    await this.syncFileToSftpIfEnabled(thumbnailPath, thumbnailStoragePath);
  }

  private async syncFileToSftpIfEnabled(localFilePath: string, storagePath: string) {
    const sftpConfig = getSftpConfig();

    if (!sftpConfig) {
      return null;
    }

    const remoteFilePath = toRemotePath(sftpConfig.remoteRoot, storagePath);
    const remoteDirectory = remoteFilePath.split('/').slice(0, -1).join('/');
    const sshTarget = `${sftpConfig.user}@${sftpConfig.host}`;
    const baseSshArgs = [
      '-p',
      sftpConfig.port,
      '-o',
      'BatchMode=yes',
      '-o',
      'ConnectTimeout=10',
    ];

    if (sftpConfig.keyPath) {
      baseSshArgs.push('-i', sftpConfig.keyPath);
    }

    await runSftpCommand(
      'ssh',
      [...baseSshArgs, sshTarget, `mkdir -p '${remoteDirectory.replace(/'/g, "'\\''")}'`],
      sftpConfig.timeoutMs,
    );
    await runSftpCommand(
      'scp',
      [
        '-P',
        sftpConfig.port,
        '-o',
        'BatchMode=yes',
        '-o',
        'ConnectTimeout=10',
        ...(sftpConfig.keyPath ? ['-i', sftpConfig.keyPath] : []),
        localFilePath,
        `${sshTarget}:${remoteFilePath}`,
      ],
      sftpConfig.timeoutMs,
    );

    return remoteFilePath;
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

  private buildOptimizedImageThumbnailPath(
    normalizedPath: string,
    width: number,
    quality: number,
  ) {
    const safePath = normalizedPath
      .replace(/\\/g, '/')
      .split('/')
      .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, '-'))
      .join('/');

    return path.resolve(
      this.uploadRoot,
      IMAGE_THUMBNAIL_DIRNAME,
      `w${width}-q${quality}`,
      safePath,
    );
  }

  private async writeOptimizedImage(
    sharp: any,
    sourcePath: string,
    targetPath: string,
    extension: string,
    variant: { width: number; quality: number },
  ) {
    let pipeline = sharp(sourcePath, { failOn: 'none' }).rotate().resize({
      width: variant.width,
      withoutEnlargement: true,
    });

    if (extension === '.png') {
      pipeline = pipeline.png({ quality: variant.quality, compressionLevel: 9 });
    } else if (extension === '.webp') {
      pipeline = pipeline.webp({ quality: variant.quality });
    } else {
      pipeline = pipeline.jpeg({ quality: variant.quality, mozjpeg: true });
    }

    await pipeline.toFile(targetPath);
  }

  private loadSharp() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('sharp');
    } catch {
      return null;
    }
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

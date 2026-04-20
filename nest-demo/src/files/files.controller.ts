import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import { AllowNoPermission } from '../decorators/permission.decorator';
import { AllowNoToken } from '../decorators/token.decorator';
import { FilesService } from './files.service';

type UploadedDiskFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  destination: string;
};

function createStorage(filesService: FilesService) {
  return diskStorage({
    destination: (req, _file, callback) => {
      const folder =
        typeof req.body?.folder === 'string'
          ? req.body.folder
          : typeof req.query?.folder === 'string'
            ? req.query.folder
            : 'common';
      const { absoluteDir } = filesService.createTargetFolder(folder);
      callback(null, absoluteDir);
    },
    filename: (_req, file, callback) => {
      callback(null, filesService.buildStoredFileName(file.originalname));
    },
  });
}

@ApiTags('文件管理')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folder: { type: 'string', example: 'business' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage(new FilesService()),
      fileFilter: (_req, file, callback) => {
        if (!file.originalname) {
          callback(new BadRequestException('请选择要上传的文件'), false);
          return;
        }
        callback(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  upload(
    @UploadedFile() file: UploadedDiskFile,
    @Query('folder') queryFolder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const relativeDirectory = path
      .relative(this.filesService.uploadRoot, file.destination)
      .replace(/\\/g, '/');
    const filePath = [relativeDirectory, file.filename]
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/');

    return this.filesService.buildFileResponse(file, filePath);
  }

  @Get('preview')
  @AllowNoToken()
  @AllowNoPermission()
  @ApiOperation({ summary: '预览文件' })
  @ApiQuery({ name: 'path', required: true, description: '上传返回的 storagePath' })
  preview(@Query('path') filePath: string, @Res() res: Response) {
    const { absolutePath } = this.filesService.resolveStoredFile(filePath);
    return res.sendFile(absolutePath);
  }

  @Get('download')
  @AllowNoToken()
  @AllowNoPermission()
  @ApiOperation({ summary: '下载文件' })
  @ApiQuery({ name: 'path', required: true, description: '上传返回的 storagePath' })
  download(@Query('path') filePath: string, @Res() res: Response) {
    const { absolutePath, fileName } = this.filesService.resolveStoredFile(filePath);
    return res.download(absolutePath, fileName);
  }

  @Get('legacy-preview')
  @AllowNoToken()
  @AllowNoPermission()
  @Redirect()
  @ApiOperation({ summary: '跳转到历史服务器文件预览地址' })
  @ApiQuery({ name: 'path', required: true, description: '旧系统图片路径，如 /image/common/... 或 /home/project/...' })
  legacyPreview(@Query('path') filePath: string) {
    return {
      url: this.filesService.buildLegacyDownloadUrl(filePath),
    };
  }
}

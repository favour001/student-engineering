import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
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
import { buildStoredFileName, createTargetFolder, FilesService } from './files.service';
import { UploadedDiskFile } from './files.types';

function createStorage() {
  return diskStorage({
    destination: (req, _file, callback) => {
      const folder =
        typeof req.body?.folder === 'string'
          ? req.body.folder
          : typeof req.query?.folder === 'string'
            ? req.query.folder
            : 'common';
      const { absoluteDir } = createTargetFolder(folder);
      callback(null, absoluteDir);
    },
    filename: (_req, file, callback) => {
      callback(null, buildStoredFileName(file.originalname));
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
      storage: createStorage(),
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
    @Body('folder') bodyFolder?: string,
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

    return this.filesService.saveUploadedFile(file, filePath, bodyFolder || queryFolder);
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
  @ApiOperation({ summary: '代理读取历史服务器文件预览地址' })
  @ApiQuery({ name: 'path', required: true, description: '旧系统图片路径，如 /image/common/... 或 /home/project/...' })
  legacyPreview(@Query('path') filePath: string, @Res() res: Response) {
    const { requestImpl, requestOptions, targetUrl } = this.filesService.createLegacyAssetRequest(filePath);
    
    console.log(`[Proxy] legacy-preview: ${filePath} -> ${targetUrl.href}`);

    const proxyRequest = requestImpl.request(requestOptions, (proxyResponse) => {
      const statusCode = proxyResponse.statusCode ?? 502;
      res.status(statusCode);

      const contentType = proxyResponse.headers['content-type'];
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      const contentLength = proxyResponse.headers['content-length'];
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      const cacheControl = proxyResponse.headers['cache-control'];
      if (cacheControl) {
        res.setHeader('Cache-Control', cacheControl);
      }

      proxyResponse.pipe(res);
    });

    proxyRequest.on('timeout', () => {
      proxyRequest.destroy(new Error('读取历史图片超时'));
    });

    proxyRequest.on('error', (error) => {
      if (!res.headersSent) {
        res.status(502).json({
          message: '读取历史图片失败',
          error: error.message,
        });
        return;
      }

      res.end();
    });

    proxyRequest.end();
  }
}

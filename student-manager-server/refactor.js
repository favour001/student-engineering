const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app-api');
const serviceContent = fs.readFileSync(path.join(srcDir, 'app-api.service.ts'), 'utf-8');
const controllerContent = fs.readFileSync(path.join(srcDir, 'app-api.controller.ts'), 'utf-8');

const domains = {
  auth: { routes: ['login', 'refresh', 'me'], serviceDeps: ['AppRefreshToken', 'LxWxuser'], helpers: ['fetchWechatSession', 'fetchWechatPhone', 'fetchWechatAccessToken', 'generateAccessToken', 'generateRefreshToken', 'extractToken', 'verifyAccessToken', 'mapWxUser'] },
  user: { routes: ['getWxUser', 'updateWxUser'], serviceDeps: ['LxWxuser'], helpers: ['mapWxUser'] },
  content: { routes: ['listBanners', 'getBanner', 'listArticles', 'getArticle', 'listNotices', 'getNotice', 'listTweets', 'getTweet', 'listVideos', 'getAssociationIntro', 'getJoiningGuide'], serviceDeps: ['LxUserBanner', 'LxArticle', 'LxUserNotice', 'LxTweet', 'LxVideo', 'LxXiehui', 'LxRuhui'], helpers: ['getPage', 'mapArticle'] },
  activity: { routes: ['listActivities', 'getActivity', 'addSign', 'deleteSign'], serviceDeps: ['LxActivity', 'LxSign', 'LxWxuser'], helpers: ['getPage', 'mapActivity', 'getActivityStatusName', 'mapWxUser'] },
  card: { routes: ['listCards', 'getCardStatus', 'receiveCard', 'useCard', 'getVip', 'getWelfare'], serviceDeps: ['LxCard', 'LxVip', 'LxWelfare'], helpers: ['getPage'] },
  merchant: { routes: ['listMerchants', 'getMerchant'], serviceDeps: ['LxMerchant'], helpers: ['getPage'] },
  system: { routes: ['listPosts', 'listDepartments'], serviceDeps: ['SysPost', 'SysDepartment'], helpers: [] }
};

function extractMethod(content, methodName) {
  let idx = content.indexOf(`\n  ${methodName}(`);
  if (idx === -1) idx = content.indexOf(`\n  async ${methodName}(`);
  if (idx === -1) idx = content.indexOf(`\n  private async ${methodName}(`);
  if (idx === -1) idx = content.indexOf(`\n  private ${methodName}(`);
  if (idx === -1) return null;
  
  let start = idx + 1; // skip \n
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let end = -1;
  let foundFirstBrace = false;
  
  for (let i = start; i < content.length; i++) {
    const char = content[i];
    if ((char === '"' || char === "'" || char === '`') && content[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
        foundFirstBrace = true;
      } else if (char === '}') {
        braceCount--;
        if (foundFirstBrace && braceCount === 0) {
          end = i + 1;
          break;
        }
      }
    }
  }
  return content.substring(start, end).trim();
}

function extractControllerMethod(content, methodName) {
  const lines = content.split('\n');
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(` ${methodName}(`)) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return null;
  let actualStart = startIdx;
  while (actualStart > 0 && lines[actualStart - 1].trim().startsWith('@')) {
    actualStart--;
  }
  
  let braceCount = 0;
  let endIdx = startIdx;
  let foundFirst = false;
  for (let i = startIdx; i < lines.length; i++) {
    braceCount += (lines[i].match(/\{/g) || []).length;
    braceCount -= (lines[i].match(/\}/g) || []).length;
    if (lines[i].includes('{')) foundFirst = true;
    if (foundFirst && braceCount === 0) {
      endIdx = i;
      break;
    }
  }
  
  return lines.slice(actualStart, endIdx + 1).join('\n');
}

for (const [domain, config] of Object.entries(domains)) {
  const dir = path.join(srcDir, domain);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  
  let controllerMethods = config.routes.map(r => {
     if (r === 'login') return extractControllerMethod(controllerContent, 'loginByGet') + '\n\n  ' + extractControllerMethod(controllerContent, 'loginByPost');
     return extractControllerMethod(controllerContent, r);
  }).filter(Boolean).join('\n\n  ');
  
  let cName = `App${domain.charAt(0).toUpperCase() + domain.slice(1)}Controller`;
  let sName = `App${domain.charAt(0).toUpperCase() + domain.slice(1)}Service`;
  
  let controllerTemplate = `import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { ${sName} } from './app-${domain}.service';

@AllowNoToken()
@Controller('app')
export class ${cName} {
  constructor(private readonly service: ${sName}) {}

  ${controllerMethods.replace(/this\.appApiService/g, 'this.service')}
}
`;
  fs.writeFileSync(path.join(dir, `app-${domain}.controller.ts`), controllerTemplate);
  
  let serviceMethods = config.routes.map(r => extractMethod(serviceContent, r)).filter(Boolean).join('\n\n  ');
  let helperMethods = config.helpers.map(r => extractMethod(serviceContent, r)).filter(Boolean).join('\n\n  ');
  
  let repoInjections = config.serviceDeps.map(dep => {
     let repoVar = dep.charAt(0).toLowerCase() + dep.slice(1).replace('Lx', '').replace('Sys', '') + 'Repo';
     if (dep === 'LxActivity') repoVar = 'activityRepo';
     if (dep === 'LxArticle') repoVar = 'articleRepo';
     if (dep === 'LxCard') repoVar = 'cardRepo';
     if (dep === 'LxMemberStyle') repoVar = 'memberStyleRepo';
     if (dep === 'LxRuhui') repoVar = 'ruhuiRepo';
     if (dep === 'LxSign') repoVar = 'signRepo';
     if (dep === 'LxTweet') repoVar = 'tweetRepo';
     if (dep === 'LxUserBanner') repoVar = 'bannerRepo';
     if (dep === 'LxUserNotice') repoVar = 'noticeRepo';
     if (dep === 'LxVideo') repoVar = 'videoRepo';
     if (dep === 'LxVip') repoVar = 'vipRepo';
     if (dep === 'LxWelfare') repoVar = 'welfareRepo';
     if (dep === 'LxWxuser') repoVar = 'wxuserRepo';
     if (dep === 'LxXiehui') repoVar = 'xiehuiRepo';
     if (dep === 'SysDepartment') repoVar = 'departmentRepo';
     if (dep === 'SysPost') repoVar = 'postRepo';
     if (dep === 'AppRefreshToken') repoVar = 'appRefreshTokenRepo';
     if (dep === 'LxMerchant') repoVar = 'merchantRepo';
     return `@InjectRepository(${dep}) private readonly ${repoVar}: Repository<${dep}>`;
  }).join(',\n    ');
  
  let importStmts = `import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
`;
  config.serviceDeps.forEach(dep => {
     if (dep === 'AppRefreshToken') importStmts += `import { ${dep} } from '../entities/app-refresh-token.entity';\n`;
     else if (dep.startsWith('Lx')) importStmts += `import { ${dep} } from '../../student-business/entities/${dep.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.entity';\n`;
     else if (dep.startsWith('Sys')) importStmts += `import { ${dep} } from '../../${dep.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace('sys', 'sys-')}/entities/${dep.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.entity';\n`;
  });
  
  let serviceTemplate = `${importStmts}
type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class ${sName} {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    ${repoInjections}
  ) {}

  ${serviceMethods}

  ${helperMethods}
}
`;
  fs.writeFileSync(path.join(dir, `app-${domain}.service.ts`), serviceTemplate);
  
  let mName = `App${domain.charAt(0).toUpperCase() + domain.slice(1)}Module`;
  let moduleTemplate = `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${cName} } from './app-${domain}.controller';
import { ${sName} } from './app-${domain}.service';
${config.serviceDeps.map(dep => {
    if (dep === 'AppRefreshToken') return `import { ${dep} } from '../entities/app-refresh-token.entity';`;
    if (dep.startsWith('Lx')) return `import { ${dep} } from '../../student-business/entities/${dep.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.entity';`;
    if (dep.startsWith('Sys')) return `import { ${dep} } from '../../${dep.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace('sys', 'sys-')}/entities/${dep.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.entity';`;
    return '';
}).filter(Boolean).join('\n')}

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      ${config.serviceDeps.join(',\n      ')}
    ]),
  ],
  controllers: [${cName}],
  providers: [${sName}],
})
export class ${mName} {}
`;
  fs.writeFileSync(path.join(dir, `app-${domain}.module.ts`), moduleTemplate);
}

// Update app-api.module.ts
let moduleDeps = Object.keys(domains).map(d => `import { App${d.charAt(0).toUpperCase() + d.slice(1)}Module } from './${d}/app-${d}.module';`).join('\n');
let moduleImports = Object.keys(domains).map(d => `App${d.charAt(0).toUpperCase() + d.slice(1)}Module`).join(', ');

let newAppApiModule = `import { Module } from '@nestjs/common';
import { AppMemberStyleModule } from './member-style/app-member-style.module';
${moduleDeps}

@Module({
  imports: [
    AppMemberStyleModule,
    ${moduleImports}
  ]
})
export class AppApiModule {}
`;

// wait, is member style a module? let's just create member style module wrapper if it doesn't exist or just import controller/service here.
// Let's just create AppMemberStyleModule dynamically to be clean:
fs.writeFileSync(path.join(srcDir, 'member-style/app-member-style.module.ts'), `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMemberStyleController } from './app-member-style.controller';
import { AppMemberStyleService } from './app-member-style.service';
import { LxMemberStyle } from '../../student-business/entities/lx-member-style.entity';
import { SysDepartment } from '../../sys-department/entities/sys-department.entity';
import { SysPost } from '../../sys-post/entities/sys-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LxMemberStyle, SysDepartment, SysPost]),
  ],
  controllers: [AppMemberStyleController],
  providers: [AppMemberStyleService],
})
export class AppMemberStyleModule {}
`);

fs.writeFileSync(path.join(srcDir, 'app-api.module.ts'), newAppApiModule);

// delete old files
fs.unlinkSync(path.join(srcDir, 'app-api.controller.ts'));
fs.unlinkSync(path.join(srcDir, 'app-api.service.ts'));

console.log('Done splitting v4!');

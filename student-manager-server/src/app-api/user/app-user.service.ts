import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { LxWxuser } from '../../student-business/entities/lx-wxuser.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppUserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LxWxuser) private readonly wxuserRepo: Repository<LxWxuser>
  ) {}

  async getWxUser(id: number) {
    const user = await this.wxuserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.mapWxUser(user);
  }

  async updateWxUser(body: Record<string, any>) {
    const id = Number(body.id || body.userId);
    if (!id) throw new BadRequestException('缺少用户 ID');
    const user = await this.wxuserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    Object.assign(user, {
      ...(body.userName !== undefined ? { userName: body.userName } : {}),
      ...(body.userEnglishName !== undefined ? { userEnglishName: body.userEnglishName } : {}),
      ...(body.nickName !== undefined ? { nickName: body.nickName } : {}),
      ...(body.avaterUrl !== undefined || body.avatarUrl !== undefined ? { avaterUrl: body.avaterUrl ?? body.avatarUrl } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.mobile !== undefined ? { mobile: body.mobile } : {}),
      ...(body.liuxueGuo !== undefined || body.studyCountry !== undefined ? { liuxueGuo: body.liuxueGuo ?? body.studyCountry } : {}),
      ...(body.liuxueSchool !== undefined || body.studySchool !== undefined ? { liuxueSchool: body.liuxueSchool ?? body.studySchool } : {}),
      ...(body.major !== undefined ? { major: body.major } : {}),
      ...(body.certificate !== undefined ? { certificate: body.certificate } : {}),
      ...(body.gender !== undefined ? { gender: body.gender } : {}),
      ...(body.companyName !== undefined ? { companyName: body.companyName } : {}),
      ...(body.companyPost !== undefined ? { companyPost: body.companyPost } : {}),
      ...(body.companyAddress !== undefined ? { companyAddress: body.companyAddress } : {}),
      ...(body.post !== undefined || body.socialPost !== undefined ? { post: body.post ?? body.socialPost } : {}),
      ...(body.jiguan !== undefined || body.nativePlace !== undefined ? { jiguan: body.jiguan ?? body.nativePlace } : {}),
      ...(body.birthday !== undefined ? { birthday: body.birthday ? new Date(body.birthday) : null } : {}),
      ...(body.archives !== undefined ? { archives: body.archives } : {}),
      ...(body.remark !== undefined ? { remark: body.remark } : {}),
    });
    return this.mapWxUser(await this.wxuserRepo.save(user));
  }

  private mapWxUser(user: LxWxuser) {
    return {
      ...user,
      avatarUrl: user.avaterUrl,
      avatar: user.avaterUrl,
      name: user.userName,
      phone: user.mobile,
      studyCountry: user.liuxueGuo,
      studySchool: user.liuxueSchool,
      socialPost: user.post,
      nativePlace: user.jiguan,
      certificate: user.certificate,
      companyName: user.companyName,
      companyPost: user.companyPost,
      companyAddress: user.companyAddress,
      gender: user.gender,
      birthday: user.birthday,
      email: user.email,
      remark: user.remark,
      userEnglishName: user.userEnglishName,
    };
  }
}

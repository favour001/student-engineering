import { Injectable, Logger, OnApplicationBootstrap, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateSysUserDto } from './dto/create-sys-user.dto';
import { UpdateSysUserDto } from './dto/update-sys-user.dto';
import { QuerySysUserDto } from './dto/query-sys-user.dto';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { SysUser } from './entities/sys-user.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { FilterBuilder } from '../common/query/filter-builder';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SysUserService {

  private readonly logger = new Logger(SysUserService.name);

  constructor(
    @InjectRepository(SysUser)
    private readonly sysUserRepo: Repository<SysUser>
  ){}

  async create(createSysUserDto: CreateSysUserDto) {
    // Check if account already exists
    const existingUser = await this.sysUserRepo.findOne({
      where: { account: createSysUserDto.account }
    });

    if (existingUser) {
      throw new ConflictException(`登录账号 ${createSysUserDto.account} 已存在`);
    }

    // Check if email already exists (if provided)
    if (createSysUserDto.email) {
      const existingEmail = await this.sysUserRepo.findOne({
        where: { email: createSysUserDto.email }
      });

      if (existingEmail) {
        throw new ConflictException(`邮箱 ${createSysUserDto.email} 已被使用`);
      }
    }

    // 哈希加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createSysUserDto.password, saltRounds);

    // 根据实际的 DTO 和 Entity 字段创建用户
    const sysUser = this.sysUserRepo.create({
      userName: createSysUserDto.userName,
      account: createSysUserDto.account,
      password: hashedPassword,
      sex: createSysUserDto.sex || '0',
      email: createSysUserDto.email || '',
      phoneNumber: createSysUserDto.phoneNumber || '',
      profileImage: createSysUserDto.profileImage || '',
      status: createSysUserDto.status ?? 0,
      delStatus: createSysUserDto.delStatus ?? 0,
      createTime: new Date(),
      updateTime: new Date(),
      createBy: 'system',
      updateBy: 'system'
    });

    return await this.sysUserRepo.save(sysUser);
  }

  findAll(page: number, limit: number, querySysUser: QuerySysUserDto) {
    const queryBuilder = this.sysUserRepo
      .createQueryBuilder('sys_user')
      .leftJoinAndSelect('sys_user.roles', 'roles')
      .leftJoinAndSelect('sys_user.sysUserPosts', 'posts')
      .leftJoinAndSelect('sys_user.department', 'department');

    return new FilterBuilder<SysUser>(queryBuilder, 'sys_user')
      .like('user_name', querySysUser.userName)
      .like('account', querySysUser.account)
      .like('phone_number', querySysUser.phoneNumber)
      .eq('status', querySysUser.status)
      .eq('sex', querySysUser.sex)
      .addOrderBy('create_time', 'DESC')
      .addOrderBy('id', 'DESC')
      .paginate({ page, limit });
  }

  async findOne(id: number) {
    const user = await this.sysUserRepo.findOne({
      where: { id },
      relations: ['roles', 'sysUserPosts', 'department']
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findOneByAccount(account: string): Promise<SysUser | undefined> {
    return await this.sysUserRepo.findOne({where: { account }})
  }

  async update(id: number, updateSysUserDto: UpdateSysUserDto) {
    const user = await this.sysUserRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    if (
      Object.prototype.hasOwnProperty.call(updateSysUserDto, 'password') &&
      !updateSysUserDto.password?.trim()
    ) {
      delete updateSysUserDto.password;
    }

    // Check if updating account and if new account already exists
    if (updateSysUserDto.account && updateSysUserDto.account !== user.account) {
      const existingUser = await this.sysUserRepo.findOne({
        where: { account: updateSysUserDto.account }
      });

      if (existingUser) {
        throw new ConflictException(`登录账号 ${updateSysUserDto.account} 已存在`);
      }
    }

    // Check if updating email and if new email already exists
    if (updateSysUserDto.email && updateSysUserDto.email !== user.email) {
      const existingEmail = await this.sysUserRepo.findOne({
        where: { email: updateSysUserDto.email }
      });

      if (existingEmail) {
        throw new ConflictException(`邮箱 ${updateSysUserDto.email} 已被使用`);
      }
    }

    // If password is being updated, hash it
    if (updateSysUserDto.password) {
      const saltRounds = 10;
      updateSysUserDto.password = await bcrypt.hash(updateSysUserDto.password, saltRounds);
    }

    // Update fields
    Object.assign(user, {
      ...updateSysUserDto,
      updateTime: new Date(),
      updateBy: 'system'
    });

    const updatedUser = await this.sysUserRepo.save(user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number) {
    const user = await this.sysUserRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // Check if user can be deleted based on delStatus
    if (user.delStatus === 0) {
      throw new BadRequestException(`用户 ${user.userName} 不允许删除`);
    }

    await this.sysUserRepo.remove(user);
    
    return { message: `用户 ${user.userName} 已删除`, id };
  }

  async softDelete(id: number) {
    const user = await this.sysUserRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    user.status = 1; // Set to disabled
    user.updateTime = new Date();
    user.updateBy = 'system';

    await this.sysUserRepo.save(user);
    
    return { message: `用户 ${user.userName} 已禁用`, id };
  }

  async batchDelete(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('请提供要删除的用户ID');
    }

    const users = await this.sysUserRepo.find({
      where: { id: In(ids) }
    });
    
    if (users.length !== ids.length) {
      throw new NotFoundException('部分用户不存在');
    }

    // Check if any user cannot be deleted
    const undeletableUsers = users.filter(u => u.delStatus === 0);
    if (undeletableUsers.length > 0) {
      throw new BadRequestException(
        `以下用户不允许删除: ${undeletableUsers.map(u => u.userName).join(', ')}`
      );
    }

    await this.sysUserRepo.remove(users);
    
    return { message: `成功删除 ${users.length} 个用户`, count: users.length };
  }

  async updateStatus(id: number, status: number) {
    const user = await this.sysUserRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    
    user.status = status;
    user.updateTime = new Date();
    user.updateBy = 'system';
    
    const updatedUser = await this.sysUserRepo.save(user);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.sysUserRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('原密码不正确');
    }

    // Hash new password
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.updateTime = new Date();
    user.updateBy = 'system';

    await this.sysUserRepo.save(user);
    
    return { message: '密码修改成功' };
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.sysUserRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    // Hash new password
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.updateTime = new Date();
    user.updateBy = 'system';

    await this.sysUserRepo.save(user);
    
    return { message: '密码重置成功' };
  }

}

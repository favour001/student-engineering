import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { LxUserBanner } from '../../student-business/entities/lx-user-banner.entity';
import { LxArticle } from '../../student-business/entities/lx-article.entity';
import { LxUserNotice } from '../../student-business/entities/lx-user-notice.entity';
import { LxTweet } from '../../student-business/entities/lx-tweet.entity';
import { LxVideo } from '../../student-business/entities/lx-video.entity';
import { LxXiehui } from '../../student-business/entities/lx-xiehui.entity';
import { LxRuhui } from '../../student-business/entities/lx-ruhui.entity';

type PageQuery = Record<string, string | number | undefined>;

@Injectable()
export class AppContentService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(LxUserBanner) private readonly bannerRepo: Repository<LxUserBanner>,
    @InjectRepository(LxArticle) private readonly articleRepo: Repository<LxArticle>,
    @InjectRepository(LxUserNotice) private readonly noticeRepo: Repository<LxUserNotice>,
    @InjectRepository(LxTweet) private readonly tweetRepo: Repository<LxTweet>,
    @InjectRepository(LxVideo) private readonly videoRepo: Repository<LxVideo>,
    @InjectRepository(LxXiehui) private readonly xiehuiRepo: Repository<LxXiehui>,
    @InjectRepository(LxRuhui) private readonly ruhuiRepo: Repository<LxRuhui>
  ) {}

  async listBanners() {
    const data = await this.bannerRepo.find({
      where: { releases: 0 },
      order: { createTime: 'DESC', id: 'DESC' },
      take: 5,
    });
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      avaterUrl: item.avaterUrl,
      bannerUrl: item.avaterUrl,
      pointUrl: item.pointUrl,
    }));
  }

  async getBanner(id: number) {
    const item = await this.bannerRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('轮播不存在');
    return item;
  }

  async listArticles(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const qb = this.articleRepo.createQueryBuilder('article');
    if (query.type !== undefined && query.type !== '') {
      qb.andWhere('article.type = :type', { type: String(query.type) });
    }
    qb.orderBy('article.orderNumber', 'DESC').addOrderBy('article.id', 'DESC');
    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: rows.map((item) => this.mapArticle(item)), total, pageNum, pageSize, hasMore: pageNum * pageSize < total };
  }

  async getArticle(id: number) {
    const item = await this.articleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('文章不存在');
    return this.mapArticle(item);
  }

  async listNotices(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const [rows, total] = await this.noticeRepo.findAndCount({
      where: { releases: 0 },
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = rows.map((item) => ({
      id: item.id,
      noticeTitle: item.title,
      title: item.title,
      remark: item.remark,
      createTime: item.createTime,
    }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getNotice(id: number) {
    const item = await this.noticeRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    return { id: item.id, noticeTitle: item.title, title: item.title, remark: item.remark, createTime: item.createTime };
  }

  async listTweets(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const qb = this.tweetRepo.createQueryBuilder('tweet');
    if (query.tweetType) qb.andWhere('tweet.tweetType = :tweetType', { tweetType: String(query.tweetType) });
    qb.orderBy('tweet.createTime', 'DESC').addOrderBy('tweet.id', 'DESC');
    const [rows, total] = await qb.skip((pageNum - 1) * pageSize).take(pageSize).getManyAndCount();
    const list = rows.map((item) => ({ id: item.id, tweetTitle: item.tweetTitle, tweetType: item.tweetType, tweetImg: item.tweetImg, tweetContent: item.tweetContent, createTime: item.createTime }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getTweet(id: number) {
    const item = await this.tweetRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('内容不存在');
    return item;
  }

  async listVideos(query: PageQuery) {
    const { pageNum, pageSize } = this.getPage(query, 10);
    const [rows, total] = await this.videoRepo.findAndCount({
      where: { releases: 0 },
      order: { createTime: 'DESC', id: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = rows.map((item) => ({ id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark, feeldId: item.feeldId, finderUserName: item.finderUserName }));
    return query.pageNum || query.pageSize ? { list, total, pageNum, pageSize, hasMore: pageNum * pageSize < total } : list;
  }

  async getAssociationIntro(id: number) {
    const item = await this.xiehuiRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('协会介绍不存在');
    return { id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark };
  }

  async getJoiningGuide(id: number) {
    const item = await this.ruhuiRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('入会须知不存在');
    return { id: item.id, title: item.title, avaterUrl: item.avaterUrl, remark: item.remark };
  }

  private getPage(query: PageQuery, defaultSize: number) {
    const pageNum = Math.max(Number(query.pageNum || query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize || query.limit || defaultSize), 1), 50);
    return { pageNum, pageSize };
  }

  private mapArticle(item: LxArticle) {
    return {
      id: item.id,
      title: item.title,
      articleUrl: item.articleUrl,
      avaterUrl: item.articleUrl,
      type: item.type,
      contentType: item.contentType,
      remark: item.remark,
      describe: item.remark,
      createTime: item.createTime,
    };
  }
}

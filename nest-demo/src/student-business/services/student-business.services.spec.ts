import { ActivityBusinessService } from './activity-business.service';
import { BenefitBusinessService } from './benefit-business.service';
import { ContentBusinessService } from './content-business.service';
import { MemberBusinessService } from './member-business.service';

function createRepoMock(initial: Record<string, any>[] = []) {
  const data = [...initial];
  return {
    create: jest.fn((payload: Record<string, any>) => ({ ...payload })),
    save: jest.fn(async (payload: any) => payload),
    find: jest.fn(async () => data),
    findOne: jest.fn(async ({ where: { id } }: any) => data.find((item) => item.id === id) ?? null),
    remove: jest.fn(async (payload: any) => payload),
    createQueryBuilder: jest.fn(() => {
      const builder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(async () => [data, data.length]),
      };
      return builder;
    }),
  };
}

describe('Student business services', () => {
  it('activity service should map activity create payload', async () => {
    const activityRepo = createRepoMock();
    const signRepo = createRepoMock();
    const service = new ActivityBusinessService(activityRepo as never, signRepo as never);

    await service.create({
      category: 'activity',
      title: '校友活动',
      summary: '活动内容',
      coverImage: 'cover.png',
      source: '政策',
      author: '联系人',
      mobile: '13800000000',
      startTime: '2026-04-18T10:00:00.000Z',
      endTime: '2026-04-18T12:00:00.000Z',
      address: '顺德',
      money: 99,
      quantity: 50,
      extraType: '校友',
    });

    expect(activityRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '校友活动',
        remark: '活动内容',
        avaterUrl: 'cover.png',
        signQuota: 50,
      }),
    );
  });

  it('benefit service should map vip create payload', async () => {
    const vipRepo = createRepoMock();
    const welfareRepo = createRepoMock();
    const cardRepo = createRepoMock();
    const service = new BenefitBusinessService(
      vipRepo as never,
      welfareRepo as never,
      cardRepo as never,
    );

    await service.create({
      category: 'vip',
      title: '留学会员卡',
      content: '会员权益',
      summary: '年度卡',
      coverImage: 'vip.png',
      rule: '全年使用',
      startTime: '2026-04-18T10:00:00.000Z',
      endTime: '2026-05-18T10:00:00.000Z',
    });

    expect(vipRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '留学会员卡',
        membershipDescribe: '会员权益',
        remark: '年度卡',
      }),
    );
  });

  it('member service should map extended wechat-user payload', async () => {
    const managerRepo = createRepoMock();
    const xiehuiRepo = createRepoMock();
    const ruhuiRepo = createRepoMock();
    const wxuserRepo = createRepoMock();
    const cardRepo = createRepoMock();
    const service = new MemberBusinessService(
      managerRepo as never,
      xiehuiRepo as never,
      ruhuiRepo as never,
      wxuserRepo as never,
      cardRepo as never,
    );

    await service.create({
      category: 'wechat-user',
      title: '张三',
      subTitle: '微信张三',
      mobile: '13800000000',
      author: 'openid-1',
      summary: '简介',
      content: '档案',
      userEnglishName: 'Tom',
      orderNumber: 'NO-1',
      studyCountry: '英国',
      vipFlag: '1',
      auditStatus: '1',
    });

    expect(wxuserRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: '张三',
        nickName: '微信张三',
        mobile: '13800000000',
        wxopenid: 'openid-1',
        userEnglishName: 'Tom',
        order: 'NO-1',
        liuxueGuo: '英国',
        vip: '1',
        status: '1',
      }),
    );
  });

  it('member service should assign card users without duplicates', async () => {
    const managerRepo = createRepoMock();
    const xiehuiRepo = createRepoMock();
    const ruhuiRepo = createRepoMock();
    const wxuserRepo = createRepoMock();
    const cardRepo = createRepoMock([{ id: 1, cardId: '3', userId: '10', type: '1' }]);
    const service = new MemberBusinessService(
      managerRepo as never,
      xiehuiRepo as never,
      ruhuiRepo as never,
      wxuserRepo as never,
      cardRepo as never,
    );

    const result = await service.assignUsersToCard(3, 'vip', [10, 11, 12]);

    expect(result.count).toBe(2);
    expect(cardRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ cardId: '3', userId: '11', type: '1' }),
      expect.objectContaining({ cardId: '3', userId: '12', type: '1' }),
    ]);
  });

  it('content service should map service-platform to merchant table', async () => {
    const noticeRepo = createRepoMock();
    const articleRepo = createRepoMock();
    const tweetRepo = createRepoMock();
    const informationRepo = createRepoMock();
    const videoRepo = createRepoMock();
    const bannerRepo = createRepoMock();
    const quickAccessRepo = createRepoMock();
    const merchantRepo = createRepoMock();
    const merchantUserRepo = createRepoMock();
    const wxuserRepo = createRepoMock([{ id: 1 }, { id: 2 }]);
    const service = new ContentBusinessService(
      noticeRepo as never,
      articleRepo as never,
      tweetRepo as never,
      informationRepo as never,
      videoRepo as never,
      bannerRepo as never,
      quickAccessRepo as never,
      merchantRepo as never,
      merchantUserRepo as never,
      wxuserRepo as never,
    );

    await service.create({
      category: 'service-platform',
      title: '服务商家',
      content: '平台介绍',
      coverImage: 'merchant.png',
    });

    expect(merchantRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '服务商家',
        content: '平台介绍',
        coverUrl: 'merchant.png',
      }),
    );
  });

  it('content service should assign all merchant users', async () => {
    const noticeRepo = createRepoMock();
    const articleRepo = createRepoMock();
    const tweetRepo = createRepoMock();
    const informationRepo = createRepoMock();
    const videoRepo = createRepoMock();
    const bannerRepo = createRepoMock();
    const quickAccessRepo = createRepoMock();
    const merchantRepo = createRepoMock();
    const merchantUserRepo = createRepoMock([{ id: 1, merchantId: '5', userId: '1' }]);
    const wxuserRepo = createRepoMock([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const service = new ContentBusinessService(
      noticeRepo as never,
      articleRepo as never,
      tweetRepo as never,
      informationRepo as never,
      videoRepo as never,
      bannerRepo as never,
      quickAccessRepo as never,
      merchantRepo as never,
      merchantUserRepo as never,
      wxuserRepo as never,
    );

    const result = await service.assignAllMerchantUsers(5);

    expect(result.count).toBe(2);
    expect(merchantUserRepo.save).toHaveBeenCalled();
  });
});

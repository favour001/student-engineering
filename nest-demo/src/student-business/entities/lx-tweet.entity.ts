import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lx_tweet' })
export class LxTweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'tweet_title', length: 200, comment: '标题' })
  tweetTitle: string;

  @Column({ type: 'varchar', name: 'tweet_type', length: 100, nullable: true, comment: '类型' })
  tweetType?: string | null;

  @Column({ type: 'longtext', name: 'tweet_content', nullable: true, comment: '内容' })
  tweetContent?: string | null;

  @Column({ type: 'varchar', name: 'tweet_img', length: 500, nullable: true, comment: '图片' })
  tweetImg?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'bigint', name: 'create_by', nullable: true })
  createBy?: string | null;
}

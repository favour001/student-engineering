import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lx_member_style_post' })
export class LxMemberStylePost {
  @PrimaryColumn({ type: 'bigint', name: 'member_style_id' })
  memberStyleId: number;

  @PrimaryColumn({ type: 'bigint', name: 'post_id' })
  postId: number;
}

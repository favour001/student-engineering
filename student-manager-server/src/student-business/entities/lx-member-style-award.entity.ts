import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lx_member_style_award' })
export class LxMemberStyleAward {
  @PrimaryColumn({ type: 'bigint', name: 'member_style_id' })
  memberStyleId: number;

  @PrimaryColumn({ type: 'bigint', name: 'award_id' })
  awardId: number;
}

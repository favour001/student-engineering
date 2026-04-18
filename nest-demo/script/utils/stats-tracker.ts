import { SeedStats } from '../interfaces/seed-config.interface';

export class StatsTracker {
  private stats: SeedStats = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    total: 0
  };

  incrementCreated() {
    this.stats.created++;
  }

  incrementUpdated() {
    this.stats.updated++;
    this.stats.created--; // 调整统计
  }

  incrementSkipped() {
    this.stats.skipped++;
    this.stats.created--; // 调整统计
  }

  incrementFailed() {
    this.stats.failed++;
  }

  addTotal(count: number) {
    this.stats.total += count;
  }

  getStats(): SeedStats {
    return { ...this.stats };
  }

  display() {
    console.log(`
📊 执行统计:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  总数量: ${this.stats.total}
  创建: ${this.stats.created}
  更新: ${this.stats.updated} 
  跳过: ${this.stats.skipped}
  失败: ${this.stats.failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}
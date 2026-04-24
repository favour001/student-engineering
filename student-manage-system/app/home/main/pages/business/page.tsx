"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { businessCategoryConfigMap } from "./config";

const categoryEntries = [
  "activity",
  "sign",
  "member-style",
  "association-intro",
  "joining-guide",
  "notice",
  "article",
  "innovation-shunde",
  "study-abroad-news",
  "video",
  "banner",
  "quick-access",
  "service-platform",
  "wechat-user",
  "vip",
  "welfare",
  "card",
] as const;

export default function BusinessHomePage() {
  return (
    <div className="space-y-6 p-5">
      <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,_rgba(16,185,129,0.18),_rgba(255,255,255,0.96)_45%,_rgba(14,165,233,0.12))] p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Business Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          业务管理工作台
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          这里统一维护活动、报名、文章、视频、轮播图、金刚区、留学服务平台、会员卡、福利、卡包，以及成员风采、协会介绍、公告与微信用户信息等业务内容。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categoryEntries.map((category) => {
          const config = businessCategoryConfigMap[category];

          return (
            <Link
              key={category}
              className="group rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-emerald-200"
              href={`/home/main/pages/business/${category}`}
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {config.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {config.subtitle}
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-700">
                进入管理
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

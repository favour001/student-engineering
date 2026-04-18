"use client"

import Link from "next/link"
import { ArrowRight, BookOpenText, Database, Layers3, ShieldCheck } from "lucide-react"

const quickLinks = [
  { title: "用户管理", desc: "维护账号、角色与访问状态", href: "/home/main/pages/platform/user", icon: ShieldCheck },
  { title: "菜单权限", desc: "检查导航结构与权限颗粒度", href: "/home/main/pages/platform/menu", icon: Layers3 },
  { title: "公告管理", desc: "发布协会公告与活动通知", href: "/home/main/pages/business/notice", icon: BookOpenText },
  { title: "微信用户信息", desc: "维护私域用户档案与备注", href: "/home/main/pages/business/wechat-user", icon: Database },
]

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.25),_transparent_40%),linear-gradient(135deg,_#0f172a,_#164e63_55%,_#e0f2fe)] px-6 py-8 text-white shadow-[0_30px_80px_-40px_rgba(14,165,233,0.65)]">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs tracking-[0.2em] text-sky-100 uppercase">
            Student Engine Admin
          </span>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            把系统管理和业务运营放到一套更顺手的后台里。
          </h1>
          <p className="max-w-xl text-sm text-slate-100/85 md:text-base">
            当前工作台已经接好系统管理页面和业务管理入口，你可以从左侧直接进入各模块，统一完成内容维护、权限配置与运营信息更新。
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_60px_-35px_rgba(14,165,233,0.35)]"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Icon className="size-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="text-sm leading-6 text-slate-500">{item.desc}</p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-sky-700">
                进入模块
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          )
        })}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6">
          <h3 className="text-lg font-semibold text-slate-900">本次改造重点</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">统一系统管理列表交互，修复分页与权限状态逻辑。</div>
            <div className="rounded-2xl bg-slate-50 p-4">补齐成员风采、公告、文章、轮播图等业务管理能力。</div>
            <div className="rounded-2xl bg-slate-50 p-4">优化侧边栏、头部面包屑与首页总览，让后台更像正式产品。</div>
            <div className="rounded-2xl bg-slate-50 p-4">前后端都新增 docs/READ.md，后续文档按统一规则沉淀。</div>
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-slate-950 p-6 text-slate-100">
          <h3 className="text-lg font-semibold">推荐操作顺序</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-300">
            <li>1. 先看系统管理模块，确认权限、角色、菜单契约是否符合预期。</li>
            <li>2. 再进入业务管理，补充各分类真实业务数据。</li>
            <li>3. 最后按 docs/READ.md 规则更新实施记录与验证结果。</li>
          </ol>
        </div>
      </section>
    </div>
  )
}

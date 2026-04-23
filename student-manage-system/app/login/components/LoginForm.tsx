'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { CheckCircle2, ShieldCheck } from "lucide-react"
import { useLogin } from "../hooks/useLogin"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState('')
    const { login, loading, phase, error } = useLogin()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login({ account, password });
    };

    const isRedirecting = phase === "redirecting"
    const isAuthenticating = phase === "authenticating"
    const isBusy = loading || isRedirecting

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card
                className={cn(
                    "overflow-hidden border-white/70 bg-white/90 p-0 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-500",
                    isRedirecting && "scale-[0.985] shadow-[0_40px_100px_-45px_rgba(14,165,233,0.5)]",
                )}
            >
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form
                        className={cn(
                            "relative p-6 transition-all duration-500 md:p-8",
                            isRedirecting && "pointer-events-none scale-[0.985] opacity-40 blur-[1px]",
                        )}
                        onSubmit={handleSubmit}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">欢迎回来</h1>
                                <p className="text-muted-foreground text-balance">
                                    登录留学生协会管理系统
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="email">账号</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="请输入账号"
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                    disabled={isBusy}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">密码</Label>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        忘记密码?
                                    </a>
                                </div>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="请输入密码" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isBusy}
                                    required 
                                />
                            </div>
                            {error ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                    {error}
                                </div>
                            ) : null}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isBusy}
                            >
                                {isRedirecting ? "正在进入首页..." : isAuthenticating ? "登录验证中..." : "登录"}
                            </Button>
                            <div className="overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={cn(
                                        "h-1 rounded-full bg-[linear-gradient(90deg,#0ea5e9,#14b8a6)] transition-all duration-500",
                                        isRedirecting
                                            ? "w-full"
                                            : isAuthenticating
                                              ? "w-2/3 animate-pulse"
                                              : "w-0",
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_38%,#e0f2fe_72%,#ecfeff_100%)] md:block">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),transparent_42%,rgba(20,184,166,0.22))]" />
                        <div className="relative flex h-full flex-col justify-between p-8">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200/80 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                                <ShieldCheck className="size-3.5" />
                                Secure Access
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-sky-700">管理入口</p>
                                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                                        留学生协会后台
                                    </h2>
                                </div>
                                <p className="max-w-sm text-sm leading-6 text-slate-600">
                                    登录后将自动进入首页并初始化菜单、用户信息与业务模块。
                                </p>
                                <div className="grid gap-3">
                                    <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm">
                                        登录成功后会显示过渡态，避免误判为未登录成功。
                                    </div>
                                    <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-700">
                                        当前状态：
                                        {isRedirecting
                                            ? " 正在进入首页"
                                            : isAuthenticating
                                              ? " 正在校验账号"
                                              : " 等待登录"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div
                className={cn(
                    "pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(240,249,255,0.98),rgba(224,242,254,0.95)_36%,rgba(241,245,249,0.94)_72%,rgba(255,255,255,0.96))] opacity-0 backdrop-blur-xl transition-all duration-500",
                    isRedirecting && "pointer-events-auto opacity-100",
                )}
            >
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 top-[-8%] size-72 rounded-full bg-sky-300/25 blur-3xl" />
                    <div className="absolute right-[-8%] top-[18%] size-80 rounded-full bg-cyan-300/20 blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[22%] size-96 rounded-full bg-emerald-300/20 blur-3xl" />
                </div>
                <div className="relative mx-6 w-full max-w-md overflow-hidden rounded-[32px] border border-white/80 bg-white/82 p-8 text-center shadow-[0_40px_120px_-45px_rgba(14,165,233,0.45)]">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0ea5e9,#14b8a6,#22c55e)]" />
                    <div className="flex flex-col items-center gap-5">
                        <div className="relative flex size-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffffff,#dbeafe)] shadow-[0_25px_80px_-35px_rgba(14,165,233,0.7)]">
                            <CheckCircle2 className="size-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                                LOGIN SUCCESS
                            </p>
                            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                                正在进入首页
                            </h3>
                            <p className="text-sm leading-6 text-slate-600">
                                已完成账号校验，正在初始化菜单、用户信息和首页内容。
                            </p>
                        </div>
                        <div className="w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-1.5 w-full origin-left animate-pulse rounded-full bg-[linear-gradient(90deg,#0ea5e9,#14b8a6)]" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                <div>Copyright © 2025 SOSA All Rights Reserved.</div>
                <div>
                    <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44060602002491" className="inline-block no-underline h-[20px] leading-[20px]"><img className="float-left" /><p className="float-left h-[20px] leading-[20px] m-0 ml-[5px]">粤公网安备 44060602002491号</p></a>
                </div>
            </div>
        </div>
    )
}

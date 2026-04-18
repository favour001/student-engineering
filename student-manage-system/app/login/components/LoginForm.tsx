'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useLogin } from "../hooks/useLogin"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState('')
    const { login, loading, error } = useLogin()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login({ account, password });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
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
                                    required 
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? '登录中...' : '登录'}
                            </Button>
                        </div>
                    </form>
                    <div className="relative hidden md:block overflow-hidden">
                        {/* <div className="absolute inset-0 bg-black/20" />
                        <img
                            src="/sosa.png"
                            alt="留学生协会"
                            className="absolute inset-0 h-full w-full object-contain p-8 mix-blend-overlay"
                        /> */}
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                <div>Copyright © 2025 SOSA All Rights Reserved.</div>
                <div>
                    <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44060602002491" className="inline-block no-underline h-[20px] leading-[20px]"><img className="float-left" /><p className="float-left h-[20px] leading-[20px] m-0 ml-[5px]">粤公网安备 44060602002491号</p></a>
                </div>
            </div>
        </div>
    )
}

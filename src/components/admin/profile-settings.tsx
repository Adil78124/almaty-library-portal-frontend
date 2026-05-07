"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminShellSession } from "@/components/admin/admin-session-context"
import { useAdminToast } from "@/components/admin/admin-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type BranchRow = { id: string; name: string; slug: string }

type UserRow = {
  id: string
  login: string | null
  email: string
  name: string
  role: string
  branchId: string | null
}

type MeRow = {
  id: string
  login: string | null
  email: string
  name: string
  role: string
  branchId: string | null
}

export function ProfileSettings() {
  const router = useRouter()
  const toast = useAdminToast()
  const { isSuperAdmin } = useAdminShellSession()

  const [loadError, setLoadError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [adminFormError, setAdminFormError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [login, setLogin] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const [branches, setBranches] = useState<BranchRow[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [adminEmail, setAdminEmail] = useState("")
  const [adminLogin, setAdminLogin] = useState("")
  const [adminName, setAdminName] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminBranchId, setAdminBranchId] = useState("")
  const [creating, setCreating] = useState(false)
  const [me, setMe] = useState<MeRow | null>(null)
  const [meLoadError, setMeLoadError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        setMeLoadError(null)
        const res = await fetch("/users/me", { credentials: "include" })
        const data = (await res.json().catch(() => ({}))) as MeRow & {
          error?: string
        }
        if (!res.ok) {
          setMeLoadError(data.error ?? "Не удалось загрузить профиль")
          setMe(null)
          return
        }
        setMe(data)
      } catch {
        setMeLoadError("Ошибка сети")
        setMe(null)
      }
    })()
  }, [])

  useEffect(() => {
    if (!isSuperAdmin) return
    void (async () => {
      try {
        setLoadError(null)
        const [bRes, uRes] = await Promise.all([
          fetch("/api/branches", { credentials: "include" }),
          fetch("/users", { credentials: "include" }),
        ])
        if (bRes.ok) {
          const data = (await bRes.json()) as BranchRow[]
          setBranches(Array.isArray(data) ? data : [])
        } else {
          setLoadError("Не удалось загрузить филиалы")
        }
        if (uRes.ok) {
          const data = (await uRes.json()) as UserRow[]
          setUsers(Array.isArray(data) ? data : [])
        } else {
          setLoadError("Не удалось загрузить пользователей")
        }
      } catch {
        setLoadError("Ошибка сети при загрузке данных")
      }
    })()
  }, [isSuperAdmin])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setProfileError(null)
    try {
      const body: Record<string, string> = { currentPassword }
      if (login.trim()) body.login = login.trim()
      if (email.trim()) body.email = email.trim()
      if (name.trim()) body.name = name.trim()
      if (newPassword) body.newPassword = newPassword

      const res = await fetch("/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        issues?: { path: string; message: string }[]
      }
      if (!res.ok) {
        const issueText = data.issues?.map((i) => i.message).join(" ").trim()
        setProfileError(
          issueText || data.error || "Не удалось сохранить"
        )
        return
      }
      toast.success("Профиль обновлён")
      setCurrentPassword("")
      setNewPassword("")
      setLogin("")
      setEmail("")
      setName("")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function createBranchAdmin(e: React.FormEvent) {
    e.preventDefault()
    setAdminFormError(null)
    if (!adminBranchId) {
      setAdminFormError("Выберите филиал")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/users/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail.trim(),
          login: adminLogin.trim() || undefined,
          password: adminPassword,
          name: adminName.trim(),
          branchId: adminBranchId,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setAdminFormError(data.error ?? "Не удалось создать учётную запись")
        return
      }
      toast.success("Администратор филиала создан")
      setAdminEmail("")
      setAdminLogin("")
      setAdminName("")
      setAdminPassword("")
      setAdminBranchId("")
      const uRes = await fetch("/users", { credentials: "include" })
      if (uRes.ok) {
        const list = (await uRes.json()) as UserRow[]
        setUsers(Array.isArray(list) ? list : [])
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Профиль</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Смена логина, email и пароля. Для любых изменений укажите текущий
          пароль.
        </p>
      </div>

      {meLoadError && (
        <p className="text-destructive text-sm">{meLoadError}</p>
      )}
      {me && (
        <Card>
          <CardHeader>
            <CardTitle>Сейчас в системе</CardTitle>
            <CardDescription>
              Данные учётной записи (без пароля). Имя и email отображаются в
              шапке админки после входа.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Имя</dt>
                <dd className="font-medium">{me.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Роль</dt>
                <dd className="font-medium">{me.role}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Логин</dt>
                <dd className="font-mono text-xs">{me.login ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{me.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Мои данные</CardTitle>
          <CardDescription>
            Логин и email используются для входа. После сохранения сессия
            обновится автоматически.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void saveProfile(e)} className="space-y-4">
            {profileError && (
              <p className="text-destructive text-sm">{profileError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="login">Новый логин (необязательно)</Label>
                <Input
                  id="login"
                  autoComplete="username"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="например: checkadmin"
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Отдельное имя для входа: буквы, цифры, точка или дефис,{" "}
                  <strong>без символа @</strong>. Чтобы сменить почту, заполните
                  поле «Новый email» справа.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Новый email (необязательно)</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Оставьте пустым, если не меняете"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Имя (необязательно)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как отображать в интерфейсе"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль (необязательно)</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Не короче 6 символов"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <>
          {branches.length === 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-foreground">
              <strong className="font-semibold">Сначала создайте филиалы.</strong>{" "}
              Без записей в справочнике нельзя назначить администратора.{" "}
              <Link className="font-medium text-primary underline" href="/admin/branches">
                Открыть раздел «Филиалы»
              </Link>
              .
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Новый администратор филиала</CardTitle>
              <CardDescription>
                Создаётся роль «ADMIN» с доступом только к материалам выбранного
                филиала (новости и мероприятия), без редактирования общего
                контента сайта.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadError && (
                <p className="text-destructive mb-4 text-sm">{loadError}</p>
              )}
              <form
                onSubmit={(e) => void createBranchAdmin(e)}
                className="space-y-4"
              >
                {adminFormError && (
                  <p className="text-destructive text-sm">{adminFormError}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="adminBranch">Филиал</Label>
                  <select
                    id="adminBranch"
                    className={cn(
                      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                      "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    )}
                    value={adminBranchId}
                    onChange={(e) => setAdminBranchId(e.target.value)}
                    required
                  >
                    <option value="">Выберите филиал</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLogin">Логин (необязательно)</Label>
                  <Input
                    id="adminLogin"
                    value={adminLogin}
                    onChange={(e) => setAdminLogin(e.target.value)}
                    placeholder="Иначе — из email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Имя</Label>
                  <Input
                    id="adminName"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Пароль</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    required
                    minLength={6}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? "Создание…" : "Создать администратора"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Учётные записи</CardTitle>
              <CardDescription>
                Все пользователи с доступом в админку (без паролей).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Логин</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Филиал</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground py-8 text-center"
                      >
                        Нет данных
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {u.login ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {u.branchId
                            ? branches.find((b) => b.id === u.branchId)?.name ??
                              u.branchId
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

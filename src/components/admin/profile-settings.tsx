"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type FormEvent } from "react"
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
import { cn } from "@/lib/utils"

type BranchRow = { id: string; titleRu: string }

type UserRow = {
  id: string
  login: string | null
  email: string
  name: string
  role: string
  branchId: string | null
}

type UserDraft = {
  login: string
  email: string
  name: string
  branchId: string
  password: string
}

type MeRow = UserRow

function emptyDraft(): UserDraft {
  return {
    login: "",
    email: "",
    name: "",
    branchId: "",
    password: "",
  }
}

function draftFromUser(user: UserRow): UserDraft {
  return {
    login: user.login ?? "",
    email: user.email,
    name: user.name,
    branchId: user.branchId ?? "",
    password: "",
  }
}

export function ProfileSettings() {
  const router = useRouter()
  const toast = useAdminToast()
  const { isSuperAdmin } = useAdminShellSession()

  const [loadError, setLoadError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [adminFormError, setAdminFormError] = useState<string | null>(null)
  const [userActionError, setUserActionError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [login, setLogin] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const [branches, setBranches] = useState<BranchRow[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [userDrafts, setUserDrafts] = useState<Record<string, UserDraft>>({})
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminLogin, setAdminLogin] = useState("")
  const [adminName, setAdminName] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminBranchId, setAdminBranchId] = useState("")
  const [creating, setCreating] = useState(false)

  const [me, setMe] = useState<MeRow | null>(null)
  const [meLoadError, setMeLoadError] = useState<string | null>(null)

  const branchAdmins = useMemo(
    () => users.filter((user) => user.role === "ADMIN"),
    [users]
  )
  const superAdmins = useMemo(
    () => users.filter((user) => user.role === "SUPER_ADMIN"),
    [users]
  )
  const selectedUser = useMemo(
    () => branchAdmins.find((user) => user.id === selectedUserId) ?? null,
    [branchAdmins, selectedUserId]
  )
  const selectedDraft = selectedUserId ? userDrafts[selectedUserId] : undefined

  function branchName(branchId: string | null) {
    if (!branchId) return "Филиал не выбран"
    return branches.find((branch) => branch.id === branchId)?.titleRu ?? branchId
  }

  function resetUserDrafts(list: UserRow[]) {
    const next: Record<string, UserDraft> = {}
    for (const user of list) {
      next[user.id] = draftFromUser(user)
    }
    setUserDrafts(next)
  }

  async function readError(res: Response): Promise<string> {
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      issues?: { path: string; message: string }[]
    }
    return (
      data.issues?.map((issue) => issue.message).join(" ").trim() ||
      data.error ||
      `HTTP ${res.status}`
    )
  }

  async function loadUsers() {
    const res = await fetch("/users", { credentials: "include" })
    if (!res.ok) throw new Error(await readError(res))
    const list = (await res.json()) as UserRow[]
    const safeList = Array.isArray(list) ? list : []
    setUsers(safeList)
    resetUserDrafts(safeList)
    setSelectedUserId((prev) =>
      prev && safeList.some((user) => user.id === prev && user.role === "ADMIN")
        ? prev
        : null
    )
  }

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
        const [branchesRes, usersRes] = await Promise.all([
          fetch("/api/branches", { credentials: "include" }),
          fetch("/users", { credentials: "include" }),
        ])

        if (!branchesRes.ok) {
          setLoadError("Не удалось загрузить филиалы")
        } else {
          const data = (await branchesRes.json()) as BranchRow[]
          setBranches(Array.isArray(data) ? data : [])
        }

        if (!usersRes.ok) {
          setLoadError("Не удалось загрузить пользователей")
        } else {
          const data = (await usersRes.json()) as UserRow[]
          const safeList = Array.isArray(data) ? data : []
          setUsers(safeList)
          resetUserDrafts(safeList)
        }
      } catch {
        setLoadError("Ошибка сети при загрузке данных")
      }
    })()
  }, [isSuperAdmin])

  async function saveProfile(e: FormEvent) {
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
      if (!res.ok) {
        setProfileError(await readError(res))
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

  async function createBranchAdmin(e: FormEvent) {
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
      const data = (await res.json().catch(() => ({}))) as UserRow & {
        error?: string
      }
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
      setCreateOpen(false)
      await loadUsers()
      if (data.id) setSelectedUserId(data.id)
    } finally {
      setCreating(false)
    }
  }

  function setUserDraftField(id: string, key: keyof UserDraft, value: string) {
    setUserDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? emptyDraft()),
        [key]: value,
      },
    }))
  }

  function resetSelectedDraft() {
    if (!selectedUser) return
    setUserDrafts((prev) => ({
      ...prev,
      [selectedUser.id]: draftFromUser(selectedUser),
    }))
  }

  async function saveBranchAdmin(user: UserRow) {
    const draft = userDrafts[user.id]
    if (!draft || user.role !== "ADMIN") return
    if (!draft.branchId) {
      setUserActionError("Выберите филиал для администратора.")
      return
    }

    setSavingUserId(user.id)
    setUserActionError(null)
    try {
      const payload: Record<string, string | null> = {
        name: draft.name.trim(),
        email: draft.email.trim(),
        login: draft.login.trim() || null,
        branchId: draft.branchId,
      }
      if (draft.password.trim()) payload.password = draft.password

      const res = await fetch(`/users/admin/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setUserActionError(await readError(res))
        return
      }
      toast.success("Учётная запись обновлена")
      await loadUsers()
    } finally {
      setSavingUserId(null)
    }
  }

  async function deleteBranchAdmin(user: UserRow) {
    if (user.role !== "ADMIN") return
    if (!window.confirm(`Удалить администратора ${user.name}?`)) return

    setSavingUserId(user.id)
    setUserActionError(null)
    try {
      const res = await fetch(`/users/admin/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        setUserActionError(await readError(res))
        return
      }
      toast.success("Администратор филиала удалён")
      await loadUsers()
      setSelectedUserId((prev) => (prev === user.id ? null : prev))
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Профиль</h1>
        <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">
          Здесь меняются данные текущего пользователя. Супер-админ также может
          создавать, редактировать и удалять администраторов филиалов.
        </p>
      </div>

      {meLoadError ? <p className="text-destructive text-sm">{meLoadError}</p> : null}

      {me ? (
        <Card>
          <CardHeader>
            <CardTitle>Сейчас в системе</CardTitle>
            <CardDescription>
              Эти данные используются в админке после входа.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
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
                <dd className="break-all font-mono text-xs">{me.login ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{me.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Мои данные</CardTitle>
          <CardDescription>
            Для сохранения изменений укажите текущий пароль. Пустые поля не
            меняют текущие значения.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void saveProfile(e)} className="space-y-4">
            {profileError ? (
              <p className="text-destructive text-sm">{profileError}</p>
            ) : null}
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
                <Label htmlFor="login">Новый логин</Label>
                <Input
                  id="login"
                  autoComplete="username"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Оставьте пустым, если не меняете"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Новый email</Label>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как отображать в интерфейсе"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Не короче 6 символов"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isSuperAdmin ? (
        <>
          {branches.length === 0 ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-foreground">
              <strong className="font-semibold">Сначала создайте филиалы.</strong>{" "}
              Без филиала нельзя назначить администратора.{" "}
              <Link className="font-medium text-primary underline" href="/admin/branches">
                Открыть раздел филиалов
              </Link>
              .
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Администраторы филиалов</CardTitle>
                  <CardDescription>
                    Выберите человека из списка, чтобы изменить email, логин,
                    филиал или сбросить пароль.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setCreateOpen((value) => !value)}
                  disabled={branches.length === 0}
                >
                  {createOpen ? "Закрыть форму" : "Добавить админа"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {loadError ? (
                <p className="text-destructive text-sm">{loadError}</p>
              ) : null}
              {userActionError ? (
                <p className="text-destructive text-sm">{userActionError}</p>
              ) : null}

              {createOpen ? (
                <form
                  onSubmit={(e) => void createBranchAdmin(e)}
                  className="rounded-lg border bg-muted/20 p-4"
                >
                  <div className="mb-3">
                    <h2 className="font-medium">Новый администратор</h2>
                    <p className="text-muted-foreground text-sm">
                      Создаётся роль ADMIN с доступом к материалам выбранного
                      филиала.
                    </p>
                  </div>
                  {adminFormError ? (
                    <p className="text-destructive mb-3 text-sm">{adminFormError}</p>
                  ) : null}
                  <div className="grid gap-3 md:grid-cols-2">
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
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        autoComplete="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminLogin">Логин</Label>
                      <Input
                        id="adminLogin"
                        autoComplete="username"
                        value={adminLogin}
                        onChange={(e) => setAdminLogin(e.target.value)}
                        placeholder="Можно оставить пустым"
                      />
                    </div>
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
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.titleRu}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adminPassword">Пароль</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Создание..." : "Создать"}
                    </Button>
                  </div>
                </form>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-2">
                  {branchAdmins.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                      Администраторов филиалов пока нет.
                    </div>
                  ) : (
                    branchAdmins.map((user) => {
                      const active = user.id === selectedUserId
                      return (
                        <button
                          key={user.id}
                          type="button"
                          className={cn(
                            "grid w-full gap-2 rounded-lg border px-4 py-3 text-left transition-colors md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]",
                            active
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {user.name || "Без имени"}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {user.email}
                            </span>
                          </span>
                          <span className="min-w-0 text-sm">
                            <span className="text-muted-foreground block text-xs">
                              Филиал
                            </span>
                            <span className="block truncate">
                              {branchName(user.branchId)}
                            </span>
                          </span>
                          <span className="self-center justify-self-start md:justify-self-end">
                            <span className="rounded-md border px-2 py-1 text-xs">
                              {active ? "Открыто" : "Редактировать"}
                            </span>
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  {selectedUser && selectedDraft ? (
                    <div className="space-y-4">
                      <div>
                        <h2 className="font-medium">Редактирование</h2>
                        <p className="text-muted-foreground text-sm">
                          {selectedUser.name} · {branchName(selectedUser.branchId)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedAdminName">Имя</Label>
                        <Input
                          id="selectedAdminName"
                          value={selectedDraft.name}
                          onChange={(e) =>
                            setUserDraftField(selectedUser.id, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedAdminEmail">Email</Label>
                        <Input
                          id="selectedAdminEmail"
                          type="email"
                          autoComplete="email"
                          value={selectedDraft.email}
                          onChange={(e) =>
                            setUserDraftField(selectedUser.id, "email", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedAdminLogin">Логин</Label>
                        <Input
                          id="selectedAdminLogin"
                          autoComplete="username"
                          value={selectedDraft.login}
                          onChange={(e) =>
                            setUserDraftField(selectedUser.id, "login", e.target.value)
                          }
                          placeholder="Можно оставить пустым"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedAdminBranch">Филиал</Label>
                        <select
                          id="selectedAdminBranch"
                          className={cn(
                            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                            "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          )}
                          value={selectedDraft.branchId}
                          onChange={(e) =>
                            setUserDraftField(selectedUser.id, "branchId", e.target.value)
                          }
                        >
                          <option value="">Выберите филиал</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.titleRu}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedAdminPassword">Новый пароль</Label>
                        <Input
                          id="selectedAdminPassword"
                          type="password"
                          autoComplete="new-password"
                          minLength={6}
                          value={selectedDraft.password}
                          onChange={(e) =>
                            setUserDraftField(selectedUser.id, "password", e.target.value)
                          }
                          placeholder="Оставьте пустым, если пароль не меняется"
                        />
                      </div>
                      <div className="flex flex-wrap justify-between gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={savingUserId === selectedUser.id}
                          onClick={() => void deleteBranchAdmin(selectedUser)}
                        >
                          Удалить
                        </Button>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetSelectedDraft}
                          >
                            Сбросить
                          </Button>
                          <Button
                            type="button"
                            disabled={savingUserId === selectedUser.id}
                            onClick={() => void saveBranchAdmin(selectedUser)}
                          >
                            {savingUserId === selectedUser.id
                              ? "Сохранение..."
                              : "Сохранить"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[240px] items-center justify-center text-center text-sm text-muted-foreground">
                      Нажмите «Редактировать» у нужного администратора.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Супер-админы</CardTitle>
              <CardDescription>
                Эти пользователи управляют всей админкой. Их список отделён от
                администраторов филиалов, чтобы не путать роли.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {superAdmins.length === 0 ? (
                <p className="text-muted-foreground text-sm">Супер-админов нет.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {superAdmins.map((user) => (
                    <div key={user.id} className="rounded-lg border px-4 py-3">
                      <div className="font-medium">{user.name || "Без имени"}</div>
                      <div className="text-muted-foreground mt-1 break-all text-sm">
                        {user.email}
                      </div>
                      <div className="text-muted-foreground mt-1 break-all font-mono text-xs">
                        {user.login ?? "логин не указан"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

"use client"

import React, { useEffect, useState } from "react"
import { X, Edit2, Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAdminToast } from "@/components/admin/admin-toast"
import { cn } from "@/lib/utils"

interface Administrator {
  id: string
  name: string
  email: string
  role: string
  branchId: string | null
  createdAt: string
}

interface Props {
  branchId: string
  onAdministratorChange?: (administrator: Administrator | null) => void
}

type ModalMode = "select" | "create" | null

async function fetchCurrentAdministrator(
  branchId: string
): Promise<Administrator | null> {
  const res = await fetch(
    `/api/branches/${encodeURIComponent(branchId)}/administrator`,
    { credentials: "include" }
  )
  const data = (await res.json().catch(() => ({}))) as {
    administrator?: Administrator | null
    error?: string
  }
  if (!res.ok) {
    throw new Error(data.error || "Не удалось загрузить администратора филиала")
  }
  return data.administrator || null
}

export function BranchAdministratorManager({
  branchId,
  onAdministratorChange,
}: Props) {
  const toast = useAdminToast()
  const [administrator, setAdministrator] = useState<Administrator | null>(null)
  const [admins, setAdmins] = useState<Administrator[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load current administrator
  useEffect(() => {
    async function loadAdministrator() {
      setLoading(true)
      setError(null)
      try {
        setAdministrator(await fetchCurrentAdministrator(branchId))
      } catch (e) {
        console.error("Failed to load administrator:", e)
        setError(
          e instanceof Error
            ? e.message
            : "Не удалось загрузить администратора филиала"
        )
      } finally {
        setLoading(false)
      }
    }
    loadAdministrator()
  }, [branchId])

  // Load available admins
  const loadAvailableAdmins = async () => {
    setLoadingAdmins(true)
    setError(null)
    try {
      const res = await fetch("/users/admins", {
        credentials: "include",
      })
      const data = (await res.json().catch(() => ({}))) as
        | Administrator[]
        | { error?: string }
      if (!res.ok || !Array.isArray(data)) {
        setError(
          !Array.isArray(data) && data.error
            ? data.error
            : "Ошибка при загрузке списка администраторов"
        )
        setAdmins([])
        return
      }
      setAdmins(data)
    } catch (e) {
      console.error("Failed to load admins:", e)
      setError("Ошибка при загрузке списка администраторов")
    } finally {
      setLoadingAdmins(false)
    }
  }

  const openSelectModal = () => {
    setModalMode("select")
    setSearchQuery("")
    loadAvailableAdmins()
  }

  const openCreateModal = () => {
    setModalMode("create")
    setError(null)
    setCreateForm({ name: "", email: "", password: "" })
  }

  const handleSelectAdmin = async (selectedAdmin: Administrator) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/branches/${encodeURIComponent(branchId)}/administrator`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: selectedAdmin.id }),
        }
      )
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; administrator?: Administrator; error?: string }
      if (!res.ok) {
        setError(data.error || "Ошибка при назначении администратора")
        return
      }
      setAdministrator(data.administrator || null)
      onAdministratorChange?.(data.administrator || null)
      toast.success("Администратор назначен")
      setModalMode(null)
    } catch (e) {
      console.error("Failed to set administrator:", e)
      setError("Ошибка при сохранении")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setError("Заполните все поля")
      return
    }

    setCreatingAdmin(true)
    setError(null)
    try {
      const res = await fetch("/users/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          password: createForm.password.trim(),
          branchId,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string; [key: string]: unknown }
      if (!res.ok) {
        setError(data.error || "Ошибка при создании администратора")
        return
      }
      const admin = await fetchCurrentAdministrator(branchId)
      setAdministrator(admin)
      onAdministratorChange?.(admin)
      toast.success("Администратор создан и назначен")
      setModalMode(null)
      setCreateForm({ name: "", email: "", password: "" })
    } catch (e) {
      console.error("Failed to create admin:", e)
      setError("Ошибка при сохранении")
    } finally {
      setCreatingAdmin(false)
    }
  }

  const handleRemoveAdministrator = async () => {
    if (!window.confirm("Вы уверены, что хотите снять администратора с этого филиала?")) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/branches/${encodeURIComponent(branchId)}/administrator`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: null }),
        }
      )
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || "Ошибка при снятии администратора")
        return
      }
      setAdministrator(null)
      onAdministratorChange?.(null)
      toast.success("Администратор снят с филиала")
    } catch (e) {
      console.error("Failed to remove administrator:", e)
      setError("Ошибка при сохранении")
    } finally {
      setLoading(false)
    }
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Ответственный администратор филиала
        </Label>
      </div>
      {error && modalMode === null && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : administrator ? (
        <div className="space-y-3 rounded-lg bg-muted/50 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Имя</p>
              <p className="font-medium">{administrator.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{administrator.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Роль</p>
              <p className="text-sm">Администратор</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Статус</p>
              <p className="text-sm text-green-600">Активен</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openSelectModal}
              disabled={loading || loadingAdmins}
              className="gap-2"
            >
              <Edit2 className="size-4" />
              Изменить администратора
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              disabled={loading}
              className="gap-2"
            >
              <Plus className="size-4" />
              Добавить нового администратора
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveAdministrator}
              disabled={loading}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="size-4" />
              Удалить
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            Администратор филиала не назначен
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={openSelectModal}
              disabled={loadingAdmins}
              className="gap-2"
            >
              <Edit2 className="size-4" />
              Назначить администратора
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="gap-2"
            >
              <Plus className="size-4" />
              Добавить нового администратора
            </Button>
          </div>
        </div>
      )}

      {/* Modal for selecting existing admin */}
      <Dialog open={modalMode === "select"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Выбрать администратора</DialogTitle>
            <DialogDescription>
              Выберите существующего администратора для назначения на этот филиал
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Input
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {loadingAdmins ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAdmins.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {admins.length === 0 ? "Администраторы не найдены" : "Совпадений не найдено"}
                </p>
              ) : (
                filteredAdmins.map((admin) => (
                  <button
                    type="button"
                    key={admin.id}
                    onClick={() => void handleSelectAdmin(admin)}
                    disabled={loading}
                    className={cn(
                      "w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted",
                      admin.branchId && admin.branchId !== branchId
                        ? "opacity-60 hover:bg-transparent"
                        : ""
                    )}
                  >
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                    {admin.branchId && admin.branchId !== branchId && (
                      <p className="mt-1 text-xs text-orange-600">
                        Уже назначен на другой филиал. При сохранении будет переназначен.
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal for creating new admin */}
      <Dialog open={modalMode === "create"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать администратора филиала</DialogTitle>
            <DialogDescription>
              Новый администратор будет создан и сразу привязан к этому филиалу
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-name">Имя</Label>
              <Input
                id="admin-name"
                placeholder="Полное имя администратора"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={creatingAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="email@example.com"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={creatingAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Пароль</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Минимум 6 символов"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, password: e.target.value }))
                }
                disabled={creatingAdmin}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => void handleCreateAdmin()}
                disabled={creatingAdmin}
              >
                {creatingAdmin ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalMode(null)}
                disabled={creatingAdmin}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

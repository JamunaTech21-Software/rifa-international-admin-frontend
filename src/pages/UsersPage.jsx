import { useState } from 'react'
import { Plus, RotateCw, UserCheck, UserPen, UserX } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toaster'
import { useAuth } from '@/admin/AuthProvider'
import { ApiError, apiPatch, apiPost } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatDateTimeShort } from '@/lib/format'
import useApiQuery from '@/lib/useApiQuery'
import UserFormDialog from '@/features/users/UserFormDialog'
import { roleLabel } from '@/features/users/roles'

function StateBadge({ user }) {
  const [text, style] = !user.is_active
    ? ['Inactive', 'bg-surface-2 text-muted']
    : user.is_locked
      ? ['Locked', 'bg-warning-50 text-tone-orange']
      : ['Active', 'bg-success-50 text-success-700']
  return (
    <span
      className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', style)}
    >
      {text}
    </span>
  )
}

export default function UsersPage() {
  const toast = useToast()
  const { admin } = useAuth()
  const { data, loading, error, reload, setData } = useApiQuery('/admin/users')
  const [editing, setEditing] = useState(null) // null | 'new' | user
  const [deactivating, setDeactivating] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const users = data ?? []

  const replaceUser = (updated) =>
    setData((current) => current.map((user) => (user.id === updated.id ? updated : user)))

  const saveUser = async (values) => {
    if (editing === 'new') {
      const response = await apiPost('/admin/users', values)
      setData((current) => [...current, response.data])
      toast.success(`${response.data.name} was added.`)
    } else {
      const changes = { name: values.name, role: values.role }
      if (values.password) changes.password = values.password
      const response = await apiPatch(`/admin/users/${editing.id}`, changes)
      replaceUser(response.data)
      toast.success('Changes saved.')
    }
    setEditing(null)
  }

  const setActive = async (user, isActive) => {
    setBusy(true)
    setActionError('')
    try {
      const response = await apiPatch(`/admin/users/${user.id}`, { is_active: isActive })
      replaceUser(response.data)
      toast.success(isActive ? `${user.name} was activated.` : `${user.name} was deactivated.`)
      setDeactivating(null)
    } catch (caught) {
      setDeactivating(null)
      setActionError(
        caught instanceof ApiError && caught.status !== 0
          ? (Object.values(caught.fields)[0] ?? caught.message)
          : 'Could not reach the server. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <title>Users | Rifa International Admin</title>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Users</h1>
          {data && (
            <p className="mt-0.5 text-body">
              {users.length} {users.length === 1 ? 'admin' : 'admins'}
            </p>
          )}
        </div>
        <Button size="sm" iconLeft={Plus} onClick={() => setEditing('new')}>
          Add admin
        </Button>
      </div>

      {actionError && (
        <Alert variant="error" className="mb-4">
          {actionError}
        </Alert>
      )}

      <section
        aria-label="Admin users"
        aria-busy={loading}
        className="overflow-hidden rounded-card border border-line bg-white shadow-card"
      >
        {error && !loading ? (
          <div className="p-4">
            <Alert variant="error" title="The users could not be loaded">
              <p>{error.status === 0 ? 'Could not reach the server.' : error.message}</p>
              <Button size="sm" iconLeft={RotateCw} onClick={reload} className="mt-3">
                Try again
              </Button>
            </Alert>
          </div>
        ) : loading && !data ? (
          <div
            role="status"
            aria-label="Loading users"
            className="flex justify-center py-14 text-primary-600"
          >
            <Spinner size="lg" label="Loading users" />
          </div>
        ) : (
          <>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full min-w-[44rem] border-collapse text-sm">
                <thead className="bg-surface-2 text-xs tracking-wide text-ink uppercase">
                  <tr>
                    {['Name', 'Role', 'Status', 'Last sign-in (GMT+6)', ''].map((heading, index) => (
                      <th key={index} scope="col" className="px-2.5 py-2.5 text-left font-semibold">
                        {heading || <span className="sr-only">Actions</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-2.5 py-2.5">
                        <span className="block font-semibold text-ink">
                          {user.name}
                          {user.id === admin.id && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                        </span>
                        <span className="block text-xs text-muted">{user.email}</span>
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">{roleLabel(user.role)}</td>
                      <td className="px-2.5 py-2.5">
                        <StateBadge user={user} />
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap text-body">
                        {user.last_login_at ? formatDateTimeShort(user.last_login_at) : 'Never'}
                      </td>
                      <td className="px-2.5 py-2.5">
                        <RowActions
                          user={user}
                          isSelf={user.id === admin.id}
                          onEdit={() => setEditing(user)}
                          onActivate={() => setActive(user, true)}
                          onDeactivate={() => setDeactivating(user)}
                          busy={busy}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {users.map((user) => (
                <li key={user.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {user.name}
                        {user.id === admin.id && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                      </p>
                      <p className="text-xs break-words text-muted">{user.email}</p>
                    </div>
                    <StateBadge user={user} />
                  </div>
                  <p className="mt-1.5 text-xs text-body">
                    {roleLabel(user.role)} · Last sign-in{' '}
                    {user.last_login_at ? formatDateTimeShort(user.last_login_at) : 'never'}
                  </p>
                  <div className="mt-2.5">
                    <RowActions
                      user={user}
                      isSelf={user.id === admin.id}
                      onEdit={() => setEditing(user)}
                      onActivate={() => setActive(user, true)}
                      onDeactivate={() => setDeactivating(user)}
                      busy={busy}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <UserFormDialog
        open={editing !== null}
        user={editing === 'new' ? null : editing}
        isSelf={editing !== null && editing !== 'new' && editing.id === admin.id}
        onSubmit={saveUser}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={deactivating !== null}
        title="Deactivate this admin?"
        confirmLabel="Deactivate"
        busy={busy}
        onConfirm={() => setActive(deactivating, false)}
        onCancel={() => setDeactivating(null)}
      >
        <p>
          <strong className="font-semibold text-ink">{deactivating?.name}</strong> will be signed out
          everywhere and will not be able to sign in until you activate the account again.
        </p>
      </ConfirmDialog>
    </>
  )
}

function RowActions({ user, isSelf, onEdit, onActivate, onDeactivate, busy }) {
  return (
    <div className="flex flex-wrap gap-2 md:justify-end">
      <Button
        variant="outline"
        size="sm"
        iconLeft={UserPen}
        onClick={onEdit}
        aria-label={`Edit ${user.name}`}
      >
        Edit
      </Button>
      {user.is_active ? (
        <Button
          variant="dangerOutline"
          size="sm"
          iconLeft={UserX}
          onClick={onDeactivate}
          disabled={isSelf || busy}
          title={isSelf ? 'You cannot deactivate your own account.' : undefined}
          aria-label={`Deactivate ${user.name}`}
        >
          Deactivate
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          iconLeft={UserCheck}
          onClick={onActivate}
          disabled={busy}
          aria-label={`Activate ${user.name}`}
        >
          Activate
        </Button>
      )}
    </div>
  )
}

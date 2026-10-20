export const roleOptions = [
  { value: 'staff', label: 'Staff' },
  { value: 'super_admin', label: 'Super admin' },
]

export const roleLabel = (role) => roleOptions.find((option) => option.value === role)?.label ?? role

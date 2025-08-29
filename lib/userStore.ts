export type StoredUser = {
  id: string
  name: string
  isAdmin?: boolean
  createdAt: string
}

const USERS_KEY = 'chat:users'
const CURRENT_KEY = 'chat:user'

export function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function upsertUser(user: StoredUser) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === user.id)
  if (idx >= 0) users[idx] = user
  else users.push(user)
  saveUsers(users)
}

export function getCurrentUser(): StoredUser | null {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null') } catch { return null }
}

export function setCurrentUser(user: StoredUser) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user))
  upsertUser(user)
}

export function removeUser(id: string) {
  const users = getUsers().filter(u => u.id !== id)
  saveUsers(users)
  const cur = getCurrentUser()
  if (cur?.id === id) localStorage.removeItem(CURRENT_KEY)
}



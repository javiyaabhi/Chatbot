const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error((data as { error?: string } | null)?.error ?? 'The request could not be completed.')
  }
  return data as T
}

export const api = {
  guest: () => request<{ user: import('./types').User }>('/auth/guest', { method: 'POST', body: '{}' }),
  listConversations: () => request<{ conversations: import('./types').Conversation[] }>('/conversations'),
  createConversation: (body: object) => request<{ conversation: import('./types').Conversation }>('/conversations', { method: 'POST', body: JSON.stringify(body) }),
  getConversation: (id: string) => request<{ conversation: import('./types').Conversation }>(`/conversations/${id}`),
  updateConversationLanguage: (id: string, language: import('./types').Language) =>
    request<{ conversation: import('./types').Conversation }>(`/conversations/${id}/language`, {
      method: 'PATCH',
      body: JSON.stringify({ language }),
    }),
  updateConversation: (id: string, body: { title?: string; subject?: string }) =>
    request<{ conversation: import('./types').Conversation }>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteConversation: (id: string) =>
    request<{ success: boolean; id: string }>(`/conversations/${id}`, {
      method: 'DELETE',
    }),
  sendMessage: (id: string, body: object) => request<{ message: import('./types').Message; provider: string }>(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(body) }),
}

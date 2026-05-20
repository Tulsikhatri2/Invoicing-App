export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data

  if (!data) {
    return error?.message || fallback
  }

  if (typeof data === 'string') {
    return data.trim() || fallback
  }

  if (typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }

    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title
    }

    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat().filter(Boolean)
      if (messages.length) return messages.join('\n')
    }
  }

  return fallback
}

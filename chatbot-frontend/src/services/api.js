
const API_URL = 'http://localhost:8080/api/chat'

export async function sendMessage(message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const data = await response.json()

  return data.reply
}
export async function getChatHistory() {
  const response = await fetch(`${API_URL}/history`)

  if (!response.ok) {
    throw new Error(`History request failed: ${response.status}`)
  }

  return await response.json()
}
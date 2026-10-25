// import { sendMessage } from './services/api'
// import { useState } from 'react'

// function App() {

//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const [messages, setMessages] = useState([
//     {
//       text: 'Hello! I am your chatbot assistant. How can I help you?',
//       sender: 'bot'
//     }
//   ])

//   // function handleSend() {
//   //   if (message.trim() === '') {
//   //     return
//   //   }

//   //   setMessages((previous) => [
//   //     ...previous,
//   //     { text: message, sender: 'user' },
//   //     {
//   //       text: 'Thanks for your message! We will connect the backend next.',
//   //       sender: 'bot'
//   //     }
//   //   ])

//   //   setMessage('')
//   // }



//   async function handleSend() {
//     const userMessage = message.trim()

//     if (!userMessage || loading) {
//       return
//     }

//     setMessages((previous) => [
//       ...previous,
//       { text: userMessage, sender: 'user' }
//     ])

//     setMessage('')
//     setLoading(true)

//     try {
//       const reply = await sendMessage(userMessage)

//       setMessages((previous) => [
//         ...previous,
//         { text: reply, sender: 'bot' }
//       ])
//     } catch (error) {
//       console.error('Chat API error:', error)

//       setMessages((previous) => [
//         ...previous,
//         {
//           text: 'Sorry, I could not connect to the server. Please try again.',
//           sender: 'bot'
//         }
//       ])
//     } finally {
//       setLoading(false)
//     }
//   }


//   return (
//     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden">

//         <header className="bg-blue-600 text-white p-5">
//           <h1 className="text-xl font-bold">
//             Chatbot Assistant
//           </h1>
//           <p className="text-sm text-blue-100">
//             Your personal chat assistant
//           </p>
//         </header>


//         <div className="h-96 overflow-y-auto p-4 space-y-4">

//           {messages.map((item, index) => (
//             <div
//               key={index}
//               className={`flex ${item.sender === 'user'
//                   ? 'justify-end'
//                   : 'justify-start'
//                 }`}
//             >
//               <div
//                 className={`max-w-[80%] rounded-xl px-4 py-3 ${item.sender === 'user'
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-slate-100 text-slate-800'
//                   }`}
//               >
//                 {item.text}
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="text-sm text-slate-500">
//               Chatbot is typing...
//             </div>
//           )}

//         </div>


//         <div className="border-t p-4 flex gap-2">
//           <input
//             type="text"
//             value={message}
//             onChange={(event) => setMessage(event.target.value)}
//             onKeyDown={(event) => {
//               if (event.key === 'Enter') {
//                 handleSend()
//               }
//             }}
//             placeholder="Type your message..."
//             className="flex-1 min-w-0 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <button
//             onClick={handleSend}
//             disable={loading}

//             className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
//           >
//             {loading ? 'Sending' : 'Send'}
//           </button>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default App


import { useEffect, useState } from 'react'
import { sendMessage, getChatHistory } from './services/api'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')

  // Load saved messages when the component opens
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getChatHistory()

        // Convert each saved database record into two chat messages
        const previousMessages = history.flatMap((item) => [
          {
            id: `${item.id}-user`,
            sender: 'user',
            text: item.message
          },
          {
            id: `${item.id}-bot`,
            sender: 'bot',
            text: item.reply
          }
        ])

        setMessages(previousMessages)
      } catch (err) {
        setError('Could not load chat history.')
        console.error(err)
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [])

  // Send a new message
  async function handleSend(event) {
    event.preventDefault()

    const message = input.trim()

    if (!message || loading) return

    setError('')
    setInput('')

    // Display the user's message immediately
    setMessages((previous) => [
      ...previous,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: message
      }
    ])

    setLoading(true)

    try {
      const reply = await sendMessage(message)

      // Display the backend's reply
      setMessages((previous) => [
        ...previous,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply
        }
      ])
    } catch (err) {
      setError('Could not send your message. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto flex h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg">

        {/* Header */}
        <header className="bg-blue-600 p-5 text-white">
          <h1 className="text-2xl font-bold">My Chatbot</h1>
          <p className="text-sm text-blue-100">
            Powered by Spring Boot and PostgreSQL
          </p>
        </header>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">

          {historyLoading && (
            <p className="text-center text-slate-500">
              Loading previous messages...
            </p>
          )}

          {!historyLoading && messages.length === 0 && (
            <p className="text-center text-slate-500">
              No messages yet. Start a conversation!
            </p>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-sm text-slate-500">
              Chatbot is typing...
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            disabled={loading || historyLoading}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading || historyLoading || !input.trim()}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default App

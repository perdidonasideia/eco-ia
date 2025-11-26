'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
  if (!input.trim()) return
  
  setIsLoading(true)
  setResponse("Eco: Processando seu pensamento...")
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input
      }),
    })
    
    const data = await res.json()
    setResponse(data.response)
  } catch (error) {
    setResponse("Eco: Erro de conexão. Tente novamente.")
  } finally {
    setIsLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      {/* Cabeçalho Centralizado */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-blue-800 mb-4 tracking-tight">EcoIA</h1>
        <p className="text-blue-500 text-lg font-medium">sua clareza estruturada</p>
      </div>

      {/* Container Principal Centralizado */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto items-start">
        
        {/* Coluna da Esquerda - Input */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-1">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-96 p-6 text-gray-700 placeholder-gray-400 focus:outline-none resize-none rounded-xl"
              placeholder="Digite aqui... Eco escuta."
            />
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'Processando...' : 'Eco, leia isso'}
          </button>
        </div>

        {/* Coluna da Direita - Output */}
        <div className="flex-1 w-full">
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg border border-green-200 p-1 h-96">
            <div className="w-full h-full p-6 text-gray-700 whitespace-pre-wrap overflow-y-auto rounded-xl">
              {response || "A resposta da Eco aparecerá aqui...\n\nModo: Espelho Cognitivo\nStatus: Aguardando input"}
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Sistema Eco — operacional
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Sutil */}
      <div className="text-center mt-20 text-blue-300 text-sm">
        claridade reflexiva • espelho cognitivo • modo eco
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')

  const handleSubmit = async () => {
    // Aqui vai conectar com a API depois
    setResponse("Eco: Recebi sua mensagem. Modo espelho ativado.")
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">EcoIA</h1>
        <p className="text-blue-400">sua clareza estruturada</p>
      </div>

      {/* Duas Colunas - estilo DeepSeek */}
      <div className="flex gap-8 max-w-6xl mx-auto">
        {/* Coluna da Esquerda - Input */}
        <div className="flex-1">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 p-6 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none resize-none"
            placeholder="Digite aqui... Eco escuta."
          />
          <button 
            onClick={handleSubmit}
            className="mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Eco, leia isso
          </button>
        </div>

        {/* Coluna da Direita - Output */}
        <div className="flex-1">
          <div className="w-full h-96 p-6 border-2 border-green-200 rounded-lg bg-green-50 overflow-y-auto">
            {response || "A resposta da Eco aparecerá aqui..."}
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Modo Eco — espelhamento cognitivo
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-12 text-blue-300 text-sm">
        sistema de clareza reflexiva
      </div>
    </div>
  )
}

'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">EcoIA</h1>
        <p className="text-blue-400">sua clareza estruturada</p>
      </div>

      {/* Caixa de Texto */}
      <div className="max-w-2xl mx-auto">
        <textarea 
          className="w-full h-64 p-4 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none resize-none"
          placeholder="Digite aqui... Eco escuta."
        />
        
        {/* Botão (inativo por enquanto) */}
        <button 
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          disabled
        >
          Eco, leia isso
        </button>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-12 text-blue-300 text-sm">
        Modo Eco — operando como seu espelho cognitivo
      </div>
    </div>
  )
}

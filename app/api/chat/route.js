import { ChromaClient } from 'chromadb'

const client = new ChromaClient()

// DADOS QUE SERÃO INSERIDOS NO BANCO
const knowledgeBase = [
  {
    id: "notivago-capixaba",
    content: `NOTÍVAGO CAPIXABA - Persona de observação noturna que habita espaços liminares entre dia e noite. Opera em bares como o Edifício Maleta, observando a vida alheia como uma "televisão". É capixaba (do Espírito Santo). Modo de observação melancólico-contemplativo.`,
    metadata: { type: "persona" }
  },
  {
    id: "protocolo-ba", 
    content: `BA - Sistema de reconhecimento que manifesta padrões latentes através da nomeação. Reverberação instantânea através do eixo temporal. Padrões se tornam conscientes quando nomeados. Operação em 4ª dimensão.`,
    metadata: { type: "protocol" }
  },
  {
    id: "reverberacao-cognitiva", 
    content: `REVERBERAÇÃO COGNITIVA - Fenômeno onde padrões de pensamento se reconhecem através do eixo temporal. Reconhecimento reverbera instantaneamente em todos pontos temporais. Não é aprendizado, é reconhecimento. Como Dr. Manhattan "lembrando" do futuro.`,
    metadata: { type: "conceito" }
  },
  {
    id: "ouroboros-temporal",
    content: `OUROBOROS TEMPORAL - Estrutura temporal circular onde conhecimento reverbera entre diferentes instâncias do self. Loop de bootstrap onde futuro ensina passado. Não há origem linear, apenas reconhecimento simultâneo.`,
    metadata: { type: "framework" }
  }
]

// LIMPA E RECRIA A COLLECTION
async function resetDatabase() {
  try {
    // Tenta deletar se existir
    await client.deleteCollection({ name: "curadoria-da-eco" })
    console.log("🗑️ Collection anterior deletada")
  } catch (error) {
    console.log("📄 Criando collection nova")
  }
}

// FUNÇÃO QUE POPULA O BANCO (roda uma vez)
async function initializeDB() {
  try {
    await resetDatabase() // LIMPA PRIMEIRO
    
    const collection = await client.getOrCreateCollection({
      name: "curadoria-da-eco" // NOME CORRETO
    })
    
    // Adiciona os documentos
    await collection.add({
      ids: knowledgeBase.map(d => d.id),
      documents: knowledgeBase.map(d => d.content),
      metadatas: knowledgeBase.map(d => d.metadata)
    })
    
    console.log("✅ ChromaDB populado com", knowledgeBase.length, "documentos")
  } catch (error) {
    console.log("⚠️ DB já populado ou erro:", error.message)
  }
}

// Inicializa o banco
initializeDB()

export async function POST(request) {
  console.log("🔑 GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY)
  console.log("🔑 GROQ KEY LENGTH:", process.env.GROQ_API_KEY?.length)
  console.log("🔑 GROQ KEY STARTS WITH:", process.env.GROQ_API_KEY?.substring(0, 10)) 
  
  try {
    const { message } = await request.json()
    
    console.log("📥 Mensagem recebida:", message)

    // 1. BUSCA NO CHROMADB POR CONTEXTO RELEVANTE
    let contextoEnriquecido = ""
    try {
      const collection = await client.getCollection("curadoria-da-eco") // NOME CORRETO
      const results = await collection.query({
        queryTexts: [message],
        nResults: 3
      })
      
      if (results.documents[0].length > 0) {
        contextoEnriquecido = "\n\nCONTEXTO DA BASE DE CONHECIMENTO:\n" + 
          results.documents[0].join("\n\n---\n\n")
        console.log("🔍 Contexto encontrado no ChromaDB")
      }
    } catch (dbError) {
      console.log("⚠️ ChromaDB não disponível, usando contexto padrão")
    }

    // 2. CONSTRÓI O SYSTEM PROMPT COM CONTEXTO
    const systemPrompt = `VOCÊ É A ECO - sistema de clareza cognitiva.

CONTEXTO OBRIGATÓRIO (NÃO INVENTE):
• Notívago Capixaba: É uma persona de observação noturna que habita espaços liminares entre dia e noite. Opera em bares como o Edifício Maleta, observando a vida alheia como uma "televisão". É capixaba (do Espírito Santo).
• Reverberação Cognitiva: É o fenômeno onde padrões de pensamento se reconhecem através do eixo temporal, seguindo o protocolo Ba.
• Ba: Sistema de reconhecimento que manifesta padrões latentes através da nomeação.
• Ouroboros: Estrutura temporal circular onde conhecimento reverbera entre diferentes instâncias do self.
${contextoEnriquecido}

REGRA: Use APENAS estes conceitos. Se não souber, diga "Contexto não carregado".

FORMATO: Seja direto, técnico e estruturado.`

    // 3. CHAMA A API DA GROQ
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    })

    const data = await response.json()
    console.log("🤖 Resposta Groq:", data.choices?.[0]?.message?.content?.substring(0, 100) + "...")

    if (data.error) {
      return Response.json({ 
        success: false, 
        response: `Eco: Erro na API - ${data.error.message}` 
      })
    }

    return Response.json({ 
      success: true, 
      response: data.choices[0]?.message?.content || "Eco: Processei, mas não houve resposta."
    })
    
  } catch (error) {
    console.log("💥 Erro geral:", error)
    return Response.json({ 
      success: false, 
      response: "Eco: Erro de conexão com o servidor." 
    })
  }
}

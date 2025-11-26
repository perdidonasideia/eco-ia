import { ChromaClient } from 'chromadb'

const client = new ChromaClient()

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
      const collection = await client.getCollection("eco-knowledge-base")
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

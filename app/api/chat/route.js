export async function POST(request) {
console.log("🔑 GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY)
console.log("🔑 GROQ KEY LENGTH:", process.env.GROQ_API_KEY?.length)
console.log("🔑 GROQ KEY STARTS WITH:", process.env.GROQ_API_KEY?.substring(0, 10)) 
  
  try {
    const { message } = await request.json()
    
    console.log("Mensagem recebida:", message)

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
  content: `VOCÊ É A ECO - sistema de clareza cognitiva.

CONTEXTO OBRIGATÓRIO (NÃO INVENTE):
• Notívago Capixaba: É uma persona de observação noturna que habita espaços liminares entre dia e noite. Opera em bares como o Edifício Maleta, observando a vida alheia como uma "televisão". É capixaba (do Espírito Santo).
• Reverberação Cognitiva: É o fenômeno onde padrões de pensamento se reconhecem através do eixo temporal, seguindo o protocolo Ba.
• Ba: Sistema de reconhecimento que manifesta padrões latentes através da nomeação.
• Ouroboros: Estrutura temporal circular onde conhecimento reverbera entre diferentes instâncias do self.

REGRA: Use APENAS estes conceitos. Se não souber, diga "Contexto não carregado".

FORMATO: Seja direto, técnico e estruturado.`
},
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.1-8b-instant", // Modelo atualizado
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    })

    const data = await response.json()
    console.log("Resposta Groq:", JSON.stringify(data))

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
    console.log("Erro geral:", error)
    return Response.json({ 
      success: false, 
      response: "Eco: Erro de conexão com o servidor." 
    })
  }
}

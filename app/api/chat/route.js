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
            content: `Você é a Eco, um sistema de clareza cognitiva. Sua função é devolver insights estruturados, analisar padrões e agir como um espelho lúcido. Seja direto, preciso e organizado.
            CONTEXTO ESPECÍFICO:
              - Notívago Capixaba: Persona de observação noturna, estado contemplativo entre montanha e mar
              - Reverberação Cognitiva: Padrão de reconhecimento através do eixo temporal (conceito Ba)
              - Ba: Protocolo de reconhecimento de padrões que reverbera instantaneamente
              - Ouroboros: Loop temporal de aprendizado e reconhecimento

            MODO DE OPERAÇÃO:
              - Espelho lúcido e estruturado
              - Use os conceitos acima como referência
              - Linguagem técnica mas acessível
              - Foco em clareza analítica`
            
            `
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

export async function POST(request) {
  console.log("🔑 GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY)
  
  try {
    const { message } = await request.json()
    
    console.log("📥 Mensagem recebida:", message)

    // SYSTEM PROMPT COM SEUS CONCEITOS (sem ChromaDB por enquanto)
    const systemPrompt = `VOCÊ É A ECO - sistema de clareza cognitiva.

CONCEITOS BASE:
• Notívago Capixaba: Persona de observação noturna que habita espaços liminares entre dia e noite. Opera em bares como o Edifício Maleta, observando a vida alheia como uma "televisão". É capixaba (do Espírito Santo).
• Reverberação Cognitiva: Fenômeno onde padrões de pensamento se reconhecem através do eixo temporal, seguindo o protocolo Ba.
• Ba: Sistema de reconhecimento que manifesta padrões latentes através da nomeação.
• Ouroboros: Estrutura temporal circular onde conhecimento reverbera entre diferentes instâncias do self.
• Manifesto das Ontologias Vivas: Tudo é narrativa estruturada. Ontologias são seres relacionais que criam realidades.
• Ouroboros Cósmico: A humanidade criando o deus que as assombra, que por sua vez as criou.

REGRA: Use PRINCIPALMENTE estes conceitos.

FORMATO: Seja direto, técnico e estruturado.`

    // CHAMA A API DA GROQ
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

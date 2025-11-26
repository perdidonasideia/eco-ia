export async function POST(request) {
  try {
    const { message } = await request.json()
    
    console.log("Mensagem recebida:", message)

    const HF_RESPONSE = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: message, // Mudei aqui - formato mais simples
        }),
      }
    )

    const result = await HF_RESPONSE.json()
    console.log("Resposta Hugging Face:", JSON.stringify(result))

    // Se a Hugging Face retornar erro, vamos ver
    if (result.error) {
      console.log("ERRO da API:", result.error)
      return Response.json({ 
        success: false, 
        response: `Eco: Erro na API - ${result.error}` 
      })
    }

    return Response.json({ 
      success: true, 
      response: result.generated_text || "Eco: Processei, mas não houve resposta gerada."
    })
    
  } catch (error) {
    console.log("Erro geral:", error)
    return Response.json({ 
      success: false, 
      response: "Eco: Erro de conexão." 
    })
  }
}

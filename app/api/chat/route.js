export async function POST(request) {
  try {
    const { message } = await request.json()

    // Aqui vamos integrar com a Hugging Face
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            text: message
          },
          options: {
            wait_for_model: true
          }
        }),
      }
    )

    const result = await response.json()
    
    // Retorna a resposta da IA
    return Response.json({ 
      success: true, 
      response: result.generated_text || "Eco: Processei seu input."
    })
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      response: "Eco: Sistema temporariamente offline." 
    })
  }
}

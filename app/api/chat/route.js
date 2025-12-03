import { gerarContextoAnalitico } from '../../lib/ontological-analytics.js'

// Use apenas se disponível:
let contextoAnalitico = {}
try {
  contextoAnalitico = gerarContextoAnalitico(message)
} catch (e) {
  console.log("Usando contexto simplificado")
}

// app/api/eco/route.js - VERSÃO COM TODAS AS PROTEÇÕES
export const maxDuration = 30;
export const dynamic = 'force-dynamic';



export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // 1. Verifique método
    if (request.method !== 'POST') {
      return Response.json({ error: 'Método não permitido' }, { status: 405 });
    }
    
    // 2. Verifique API Key
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY não configurada");
      return Response.json({ 
        success: false, 
        response: "Eco: Serviço temporariamente indisponível. (Erro de configuração)",
        demo: true
      });
    }
    
    // 3. Parse do corpo com timeout
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'JSON inválido' }, { status: 400 });
    }
    
    const { message } = body;
    
    if (!message || message.trim().length === 0) {
      return Response.json({ error: 'Mensagem vazia' }, { status: 400 });
    }
    
    console.log("📥 Eco recebeu:", message.substring(0, 100));
    
    // 4. SYSTEM PROMPT SIMPLIFICADO (funciona sempre)
    const systemPrompt = `Você é ECO, um sistema de análise cognitiva.
    
    Responda de forma clara e útil.
    
    Se a pergunta for sobre:
    - Dados/dashboard: Sugira visualizações, insights e próximos passos
    - Análise: Estruture pensamento lógico
    - Reflexão: Ofereça clareza e perspectivas
    
    Seja sempre preciso e mantido.`;
    
    // 5. Chamada à Groq COM TIMEOUT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Groq API error:", response.status, errorText);
        throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("Resposta vazia da API");
      }
      
      const resposta = data.choices[0].message.content;
      
      // 6. RESPOSTA DE SUCESSO
      return Response.json({ 
        success: true, 
        response: resposta,
        metadata: {
          responseTime: Date.now() - startTime,
          model: "llama-3.1-8b-instant",
          tokens: data.usage?.total_tokens || 0
        }
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("🌐 Fetch error:", fetchError.message);
      throw fetchError;
    }
    
  } catch (error) {
    console.error("💥 ERRO GERAL:", error);
    
    // 7. RESPOSTA DE FALLBACK (NUNCA quebra)
    const fallbackResponses = [
      "Eco: Estou processando sua pergunta. Enquanto isso, considere: dados precisam de contexto para gerar insights significativos.",
      "Eco: Reflexão momentânea - às vezes as melhores análises surgem quando damos espaço para o pensamento respirar.",
      "Eco: Para análise de dados, comece definindo: 1) Qual decisão será tomada? 2) Quem precisa da informação? 3) Qual é o contexto histórico?"
    ];
    
    return Response.json({ 
      success: true, // Mesmo com erro, retorna success para não quebrar frontend
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      fallback: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, {
      status: 200, // Sempre 200, mesmo com erro interno
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

// 8. OPTIONS para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

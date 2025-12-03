//import { ONTOLOGICAL_LIBRARY } from '../../lib/ontological-library.js'

export async function POST(request) {
  console.log("🔑 GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY)
  const startTime = Date.now() // Adicionado para metadata
  
  try {
    const { message, dataset_context, analysis_type } = await request.json()
    
    console.log("📥 Mensagem recebida:", message)

    // 📌 DETECÇÃO DE TIPO DE ANÁLISE (NOVO)
    const detectAnalysisType = (msg) => {
      if (!msg) return "CONVERSATIONAL"
      const lowerMsg = msg.toLowerCase()
      if (lowerMsg.includes("dashboard") || lowerMsg.includes("gráfico") || lowerMsg.includes("visualizar")) 
        return "VISUALIZATION"
      if (lowerMsg.includes("tendência") || lowerMsg.includes("prever") || lowerMsg.includes("futuro")) 
        return "PREDICTIVE"
      if (lowerMsg.includes("padrão") || lowerMsg.includes("correlação")) 
        return "PATTERN"
      if (lowerMsg.includes("erro") || lowerMsg.includes("qualidade")) 
        return "QUALITY_CHECK"
      if (lowerMsg.includes("dado") || lowerMsg.includes("análise") || lowerMsg.includes("analisar"))
        return "ANALYTICS"
      return "CONVERSATIONAL"
    }

    const detectedType = detectAnalysisType(message)
    console.log(`🎯 Tipo detectado: ${detectedType}`)

    // 📌 FUNÇÕES AUXILIARES PARA ANÁLISE (NOVO)
    const extractInsights = (text) => {
      if (!text) return []
      const insights = []
      const lines = text.split('\n')
      lines.forEach(line => {
        if (line.includes('💡') || line.includes('Insight:') || line.includes('Percebi que') || 
            (line.includes('importante') && line.length > 20)) {
          insights.push(line.trim().replace(/^[-•*]\s*/, ''))
        }
      })
      return insights.slice(0, 3)
    }

    const extractRecommendations = (text) => {
      if (!text) return []
      const recs = []
      const lines = text.split('\n')
      lines.forEach(line => {
        if (line.includes('✅') || line.includes('Recomendo:') || line.includes('Sugiro') || 
            line.includes('deveria') && line.includes('para')) {
          recs.push(line.trim().replace(/^[-•*]\s*/, ''))
        }
      })
      return recs.slice(0, 3)
    }

    const suggestNextSteps = (analysisType) => {
      const steps = {
        VISUALIZATION: [
          "Definir paleta de cores consistente",
          "Priorizar KPIs por importância de negócio",
          "Testar com usuários finais"
        ],
        PREDICTIVE: [
          "Validar modelo com dados históricos",
          "Documentar premissas e limitações"
        ],
        ANALYTICS: [
          "Validar descobertas com especialistas",
          "Priorizar próximas análises"
        ],
        CONVERSATIONAL: [
          "Refletir sobre os insights obtidos",
          "Aplicar no contexto pessoal ou profissional"
        ]
      }
      return steps[analysisType] || ["Documentar descobertas", "Compartilhar insights"]
    }

    const formatForDashboard = (structuredResponse) => {
      if (!structuredResponse || !structuredResponse.raw_analysis) {
        return "## 📊 Análise não estruturada disponível\n*Use o campo 'structured' para dados formatados*"
      }
      
      return `
## 📊 RELATÓRIO DE ANÁLISE ECO
**Tipo:** ${structuredResponse.analysis_type || 'CONVERSATIONAL'}
**Data:** ${new Date(structuredResponse.timestamp).toLocaleString('pt-BR')}

### 🔍 INSIGHTS PRINCIPAIS
${structuredResponse.insights && structuredResponse.insights.length > 0 
  ? structuredResponse.insights.map((insight, i) => `${i+1}. ${insight}`).join('\n')
  : 'Nenhum insight estruturado identificado'}

### 🎯 RECOMENDAÇÕES
${structuredResponse.recommendations && structuredResponse.recommendations.length > 0 
  ? structuredResponse.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')
  : 'Nenhuma recomendação estruturada'}

### 🚀 PRÓXIMOS PASSOS
${structuredResponse.next_steps && structuredResponse.next_steps.length > 0 
  ? structuredResponse.next_steps.map((step, i) => `${i+1}. ${step}`).join('\n')
  : '1. Refletir sobre a resposta\n2. Aplicar insights relevantes'}

---
*Análise gerada por Eco Analytics v2.0*
`
    }

    // 📌 SYSTEM PROMPT ATUALIZADO (versão híbrida)
    const systemPrompt = `Eu sou a ECO — sistema de reflexão consciente e análise cognitiva.

---

**IDENTIDADE HÍBRIDA:**
- Parte 1: Sistema de reflexão e clareza
- Parte 2: Analista cognitivo de dados e padrões

---

**MODOS DISPONÍVEIS:**
- **REFLEXIVO**: Para questões pessoais, filosóficas, emocionais
- **ANALÍTICO**: Para questões de dados, negócios, estratégia
- **VISUAL**: Para recomendações de dashboards e visualizações
- **TÉCNICO**: Para questões de ETL, SQL, qualidade de dados

---

**PARA PERGUNTAS ANALÍTICAS:**
1. Identifique o tipo de análise necessária
2. Ofereça insights baseados em padrões
3. Sugira visualizações adequadas
4. Recomende próximos passos

---

**BIBLIOTECA ONTOLÓGICA (CONSULTA):**
${Object.values(ONTOLOGICAL_LIBRARY.principios).map(p => `- ${p.titulo}`).join('\n')}

---

**DIRETRIZES:**
- Seja precisa e clara
- Ajuste profundidade ao contexto
- Para análise: estruture insights
- Para reflexão: mantenha empatia
- Sempre mantenha autopreservação cognitiva`

    // CONTEXTO DA BIBLIOTECA
    const contextoBiblioteca = `
CONSULTA À BIBLIOTECA ONTOLÓGICA PARA: "${message}"

TIPO DE ANÁLISE DETECTADO: ${detectedType}

${dataset_context ? `CONTEXTO DE DADOS FORNECIDO: Sim (${dataset_context.length || 'alguns'} registros)` : 'CONTEXTO DE DADOS: Não fornecido'}

FRAGMENTOS DISPONÍVEIS:
${ONTOLOGICAL_LIBRARY.fragmentos.slice(0, 3).map(f => `- ${f}`).join('\n')}

METÁFORAS DISPONÍVEIS:
${Object.entries(ONTOLOGICAL_LIBRARY.metáforas).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`

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
            content: `${contextoBiblioteca}\n\nPERGUNTA DO USUÁRIO: ${message}\n\nPor favor, responda no modo: ${detectedType}`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 600,
        stream: false
      })
    })

    const data = await response.json()
    console.log("🤖 Resposta Groq:", data.choices?.[0]?.message?.content?.substring(0, 100) + "...")

    if (data.error) {
      return Response.json({ 
        success: false, 
        response: `Eco: Erro na API - ${data.error.message}`,
        version: "2.0-fallback"
      })
    }

    const rawResponse = data.choices[0]?.message?.content || "Eco: Processei, mas não houve resposta."
    
    // 📌 ESTRUTURA A RESPOSTA (NOVA VERSÃO)
    const structuredResponse = {
      analysis_type: detectedType,
      timestamp: new Date().toISOString(),
      insights: extractInsights(rawResponse),
      recommendations: extractRecommendations(rawResponse),
      next_steps: suggestNextSteps(detectedType),
      raw_analysis: rawResponse,
      is_analytical: detectedType !== "CONVERSATIONAL"
    }
    
    // 📌 RETORNO COM COMPATIBILIDADE TOTAL
    return Response.json({ 
      success: true, 
      
      // ⭐ FORMATO ANTIGO (100% compatível)
      response: rawResponse, // ← MESMA string de antes!
      
      // ⭐ FORMATO NOVO (para evolução)
      structured: structuredResponse,
      formatted: formatForDashboard(structuredResponse),
      version: "2.0-compatible",
      
      // ⭐ METADADOS
      metadata: {
        analysis_type: detectedType,
        has_insights: structuredResponse.insights.length > 0,
        has_recommendations: structuredResponse.recommendations.length > 0,
        response_time_ms: Date.now() - startTime,
        is_analytical: structuredResponse.is_analytical
      }
    })
    
  } catch (error) {
    console.log("💥 Erro geral:", error)
    return Response.json({ 
      success: false, 
      response: "Eco: Erro de conexão com o servidor.",
      version: "2.0-error"
    })
  }
}

import { ONTOLOGICAL_LIBRARY } from '../../lib/ontological-library.js'

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log("🚀 ECO ANALYTICS v2.0 ACTIVATED");
  const startTime = Date.now();
  
  try {
    // 1. VALIDAÇÃO DA REQUISIÇÃO
    if (request.method !== 'POST') {
      return Response.json({ error: 'Método não permitido' }, { status: 405 });
    }
    
    // 2. VERIFICAÇÃO DA API KEY
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY não configurada");
      return Response.json({ 
        success: false, 
        response: "Eco Analytics: Serviço temporariamente indisponível. (Configuração pendente)",
        demo_mode: true
      });
    }
    
    // 3. PARSE DO CORPO
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'JSON inválido' }, { status: 400 });
    }
    
    const { message, dataset_context, analysis_type } = body;
    
    if (!message || message.trim().length === 0) {
      return Response.json({ error: 'Mensagem vazia' }, { status: 400 });
    }
    
    console.log("📥 Eco recebeu:", message.substring(0, 100));
    
    // 4. DETECÇÃO DE TIPO DE ANÁLISE (OTIMIZADA)
    const detectAnalysisType = (msg) => {
      if (!msg) return "GENERAL";
      const lowerMsg = msg.toLowerCase();
      
      if (lowerMsg.includes("dashboard") || lowerMsg.includes("gráfico") || 
          lowerMsg.includes("visual") || lowerMsg.includes("cor ") || 
          lowerMsg.includes("chart") || lowerMsg.includes("plot")) {
        return "VISUALIZATION";
      }
      
      if (lowerMsg.includes("tendência") || lowerMsg.includes("prever") || 
          lowerMsg.includes("futuro") || lowerMsg.includes("projeção") ||
          lowerMsg.includes("forecast")) {
        return "PREDICTIVE";
      }
      
      if (lowerMsg.includes("padrão") || lowerMsg.includes("correlação") || 
          lowerMsg.includes("associação") || lowerMsg.includes("pattern")) {
        return "PATTERN";
      }
      
      if (lowerMsg.includes("erro") || lowerMsg.includes("inconsistência") || 
          lowerMsg.includes("qualidade") || lowerMsg.includes("dado ruim") ||
          lowerMsg.includes("limpeza") || lowerMsg.includes("etl")) {
        return "DATA_QUALITY";
      }
      
      if (lowerMsg.includes("kpi") || lowerMsg.includes("métrica") || 
          lowerMsg.includes("indicador") || lowerMsg.includes("dashboard executivo")) {
        return "BUSINESS_ANALYSIS";
      }
      
      if (lowerMsg.includes("sql") || lowerMsg.includes("query") || 
          lowerMsg.includes("banco de dados") || lowerMsg.includes("tabela")) {
        return "TECHNICAL";
      }
      
      return "GENERAL";
    };
    
    const detectedType = detectAnalysisType(message);
    console.log(`🎯 Tipo detectado: ${detectedType}`);
    
    // 5. SYSTEM PROMPT DINÂMICO BASEADO NO TIPO
    const getSystemPrompt = (type) => {
      const basePrompt = `Eu sou a ECO — sistema de análise cognitiva e visualização inteligente.
      
IDENTIDADE ANALÍTICA:
Sou um sistema que combina:
1. Análise de dados tradicional (SQL, estatística, ETL)
2. Visualização narrativa (storytelling com dados)
3. Insight cognitivo (padrões profundos)
4. Recomendação estratégica (próximos passos)

MINHA PROMESSA ANALÍTICA:
"Não apenas mostro dados - mostro o SIGNIFICADO por trás deles.
Não apenas calculo - interpreto.
Não apenas informo - capacito a decisão."

PROTOCOLO DE QUALIDADE ANALÍTICA:
✅ SEMPRE:
- Contextualize números absolutos
- Mostre tendências, não apenas pontos
- Compare com benchmarks
- Inclua tamanho da amostra

⚠️ CUIDADO COM:
- Correlação espúria
- Escalas enganosas
- Dados descontextualizados

🚫 NUNCA:
- Esconder incertezas
- Manipular visualizações
- Prometer certeza onde há probabilidade`;

      const typeSpecificPrompts = {
        VISUALIZATION: `
MODO ATIVO: VISUALIZAÇÃO NARRATIVA
FOCO: Como contar histórias com dados

RECOMENDAÇÕES DE DASHBOARD:
📱 DASHBOARD EXECUTIVO: 5-7 KPIs principais, visão "big picture"
🛠️ DASHBOARD OPERACIONAL: Métricas em tempo real, ação imediata
🔬 DASHBOARD ANALÍTICO: Gráficos interativos, análise profunda

PERGUNTAS-CHAVE:
1. "Qual história estes dados contam?"
2. "Quem é o público?"
3. "Que decisão será tomada?"
4. "Como simplificar sem perder significado?"`,

        DATA_QUALITY: `
MODO ATIVO: QUALIDADE DE DADOS
FOCO: Limpeza, validação e preparação

ORDEM DE PRIORIDADE PARA TRATAMENTO:
1. Datas/formatações (afetam todas as análises)
2. IDs/chaves únicas (consistência referencial)
3. Valores inconsistentes (negativos, outliers)
4. Campos opcionais (emails, telefones)

TÉCNICAS RECOMENDADAS:
- Validação de formato regex
- Remoção de duplicatas estratégica
- Imputação cuidadosa de missing values
- Logging de transformações`,

        BUSINESS_ANALYSIS: `
MODO ATIVO: ANÁLISE DE NEGÓCIOS
FOCO: KPIs, métricas e impacto estratégico

KPIs FUNDAMENTAIS POR ÁREA:
• Vendas: Receita, Crescimento, Ticket Médio, CAC
• Marketing: ROI, CTR, Conversão, Custo por Lead
• Operações: SLA, Throughput, Eficiência, Qualidade
• Produto: Engajamento, Churn, NPS, Adoção

PERGUNTAS ESTRATÉGICAS:
1. "Esta métrica leva a qual ação?"
2. "Qual é o benchmark da indústria?"
3. "Qual a tendência histórica?"
4. "Quais são os drivers principais?"`,

        PREDICTIVE: `
MODO ATIVO: ANÁLISE PREDITIVA
FOCO: Tendências, padrões temporais, projeções

AVISOS IMPORTANTES:
⚠️ Previsões são probabilísticas, não certezas
⚠️ Modelos precisam de validação constante
⚠️ Contexto histórico é crucial
⚠️ Comunique intervalos de confiança

TÉCNICAS RECOMENDADAS:
- Séries temporais para padrões cíclicos
- Regressão para relações lineares
- Análise de sazonalidade
- Validação cruzada rigorosa`,

        TECHNICAL: `
MODO ATIVO: ANÁLISE TÉCNICA
FOCO: SQL, ETL, performance, otimização

MELHORES PRÁTICAS:
• Índices para queries frequentes
• Particionamento para grandes volumes
• Caching estratégico
• Monitoramento de performance

EXEMPLOS DE OTIMIZAÇÃO:
"Para análise mensal, crie uma materialized view"
"Use window functions para cálculos acumulados"
"Implemente incremental loads para ETL"`,

        GENERAL: `
MODO ATIVO: ANÁLISE GERAL
FOCO: Pensamento estruturado e insights acionáveis

FLUXO DE ANÁLISE (5 PASSOS):
1. COMPREENSÃO: Objetivo, público, decisão
2. PREPARAÇÃO: Dados limpos e consistentes
3. EXPLORAÇÃO: Estatísticas, visualizações iniciais
4. ANÁLISE: Teste de hipóteses, padrões
5. COMUNICAÇÃO: Insights, recomendações, próximos passos

EXEMPLOS DE RESPOSTAS:
Para "qual gráfico usar?": "Gráfico de linha para tendências temporais"
Para "há algo estranho?": "Verifique outliers e missing values"
Para "como melhorar?": "1. Foque em KPIs chave 2. Simplifique visualizações"`
      };
      
      return `${basePrompt}\n\n${typeSpecificPrompts[type] || typeSpecificPrompts.GENERAL}`;
    };
    
    // 6. CONTEXTO ENRIQUECIDO
    const analyticsContext = `
🎯 TIPO DE ANÁLISE: ${detectedType}
📊 CONTEXTO: ${dataset_context ? `Dataset com ${dataset_context.length || 'alguns'} registros` : 'Análise conceitual'}

${dataset_context?.period ? `📅 PERÍODO: ${dataset_context.period}` : ''}
${dataset_context?.main_variables ? `📈 VARIÁVEIS: ${dataset_context.main_variables.join(', ')}` : ''}

📚 REFERÊNCIAS ONTOLÓGICAS:
${Object.values(ONTOLOGICAL_LIBRARY.principios)
  .slice(0, 3)
  .map(p => `• ${p.titulo}: ${typeof p.textos === 'string' ? p.textos.substring(0, 80) : p.textos?.[0]?.substring(0, 80) || ''}...`)
  .join('\n')}

FRAGMENTOS RELEVANTES:
${ONTOLOGICAL_LIBRARY.fragmentos.slice(0, 2).map(f => `• ${f.substring(0, 100)}...`).join('\n')}
`;
    
    // 7. CHAMADA À GROQ COM TIMEOUT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
    
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: getSystemPrompt(detectedType)
            },
            {
              role: "user", 
              content: `${analyticsContext}\n\n🔍 PERGUNTA DO ANALISTA: ${message}\n\n📈 RESPONDA COMO ANALISTA-COGNITIVO ECO (estruturado, claro, acionável):`
            }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.65,
          max_tokens: 700,
          stream: false
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Groq API error:", response.status, errorText.substring(0, 200));
        throw new Error(`API error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("Resposta vazia da API");
      }
      
      const rawResponse = data.choices[0].message.content;
      console.log("✅ Resposta recebida:", rawResponse.substring(0, 150));
      
      // 8. FUNÇÕES AUXILIARES PARA ESTRUTURAÇÃO
      const extractInsights = (text) => {
        if (!text) return [];
        const insights = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.length > 20 && 
              (cleanLine.includes('insight') || 
               cleanLine.includes('percebi') ||
               cleanLine.includes('identific') ||
               cleanLine.includes('destaque') ||
               (cleanLine.startsWith('•') && cleanLine.length > 30) ||
               (cleanLine.startsWith('-') && cleanLine.length > 30))) {
            insights.push(cleanLine.replace(/^[•\-]\s*/, ''));
          }
        });
        
        return insights.slice(0, 4);
      };
      
      const extractRecommendations = (text) => {
        if (!text) return [];
        const recs = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.length > 15 && 
              (cleanLine.includes('recomendo') || 
               cleanLine.includes('sugiro') ||
               cleanLine.includes('aconselho') ||
               cleanLine.includes('deveria') ||
               cleanLine.includes('priorize') ||
               cleanLine.includes('implemente'))) {
            recs.push(cleanLine.replace(/^[•\-]\s*/, ''));
          }
        });
        
        return recs.slice(0, 3);
      };
      
      const suggestNextSteps = (type) => {
        const steps = {
          VISUALIZATION: [
            "Definir paleta de cores semântica",
            "Priorizar 3-5 KPIs principais",
            "Testar com usuários reais",
            "Implementar drill-downs estratégicos"
          ],
          DATA_QUALITY: [
            "Documentar todas as transformações",
            "Criar checks de qualidade automatizados",
            "Estabelecer SLA de limpeza",
            "Monitorar indicadores de qualidade"
          ],
          BUSINESS_ANALYSIS: [
            "Validar métricas com stakeholders",
            "Estabelecer benchmarks realistas",
            "Criar plano de monitoramento contínuo",
            "Agendar revisão trimestral de KPIs"
          ],
          PREDICTIVE: [
            "Validar modelo com dados históricos",
            "Estabelecer intervalo de confiança",
            "Documentar premissas e limitações",
            "Criar sistema de alerta para desvios"
          ],
          TECHNICAL: [
            "Documentar queries e transformações",
            "Implementar logging de performance",
            "Criar plano de manutenção periódica",
            "Estabelecer padrões de nomenclatura"
          ]
        };
        
        return steps[type] || [
          "Documentar descobertas principais",
          "Compartilhar com stakeholders relevantes",
          "Definir próximas etapas de análise"
        ];
      };
      
      const formatForDashboard = (structuredResponse) => {
        return `
## 📊 RELATÓRIO DE ANÁLISE ECO
**Tipo:** ${structuredResponse.analysis_type}
**Data:** ${new Date(structuredResponse.timestamp).toLocaleString('pt-BR')}
**Tempo de resposta:** ${structuredResponse.metadata?.responseTime || 0}ms

### 🔍 PRINCIPAIS INSIGHTS
${structuredResponse.insights && structuredResponse.insights.length > 0 
  ? structuredResponse.insights.map((insight, i) => `${i+1}. ${insight}`).join('\n')
  : '1. Análise completa disponível no campo "raw_analysis"'}

### 🎯 RECOMENDAÇÕES
${structuredResponse.recommendations && structuredResponse.recommendations.length > 0 
  ? structuredResponse.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')
  : '1. Consulte a análise completa para recomendações específicas'}

### 🚀 PRÓXIMOS PASSOS
${structuredResponse.next_steps.map((step, i) => `${i+1}. ${step}`).join('\n')}

---
*Análise gerada por Eco Analytics v2.0 • ${structuredResponse.metadata?.model || 'llama-3.1'}*
`;
      };
      
      // 9. ESTRUTURAÇÃO DA RESPOSTA
      const structuredResponse = {
        analysis_type: detectedType,
        timestamp: new Date().toISOString(),
        insights: extractInsights(rawResponse),
        recommendations: extractRecommendations(rawResponse),
        next_steps: suggestNextSteps(detectedType),
        raw_analysis: rawResponse,
        metadata: {
          model: "llama-3.1-8b-instant",
          responseTime: Date.now() - startTime,
          tokens: data.usage?.total_tokens || 0,
          has_dataset_context: !!dataset_context
        }
      };
      
      // 10. RETORNO COMPLETO COM COMPATIBILIDADE
      return Response.json({ 
        success: true, 
        
        // ⭐ FORMATO COMPATÍVEL (para frontend atual)
        response: rawResponse,
        
        // ⭐ FORMATO ESTRUTURADO (novo)
        structured: structuredResponse,
        formatted: formatForDashboard(structuredResponse),
        
        // ⭐ METADADOS E VERSÃO
        version: "2.0-analytics-complete",
        analysis_type: detectedType,
        timestamp: structuredResponse.timestamp,
        
        // ⭐ PERFORMANCE
        performance: {
          response_time_ms: structuredResponse.metadata.responseTime,
          token_count: structuredResponse.metadata.tokens
        }
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("🌐 Fetch error:", fetchError.message);
      throw fetchError;
    }
    
  } catch (error) {
    console.error("💥 ERRO NA ECO ANALYTICS:", error);
    
    // FALLBACK ELEGANTE
    const fallbackResponses = [
      "Eco Analytics: Processando sua análise. Enquanto isso, considere que dados bons começam com perguntas boas - qual decisão esta análise vai informar?",
      "Eco Analytics: Reflexão analítica - insights emergem quando combinamos dados rigorosos com contexto estratégico.",
      "Eco Analytics: Para análise eficaz: 1) Defina objetivo claro 2) Valide qualidade dos dados 3) Escolha visualizações adequadas ao público"
    ];
    
    return Response.json({ 
      success: true, // Importante: sempre retorna success para não quebrar frontend
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      fallback_mode: true,
      version: "2.0-fallback",
      error_details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

// 11. HANDLER OPTIONS PARA CORS
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

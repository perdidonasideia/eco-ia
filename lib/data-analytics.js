// lib/data-analytics.js - Criar se quiser
export const DATA_ANALYSIS_MODULES = {
  visualization_templates: [
    {
      id: "executive",
      name: "Dashboard Executivo",
      description: "Visão estratégica para tomada de decisão",
      kpis: ["Receita", "Crescimento", "Margem", "Satisfação"],
      charts: ["KPI Cards", "Gráfico de Linha", "Gráfico de Barras"],
      max_items: 7
    },
    {
      id: "operational",
      name: "Monitor Operacional",
      description: "Acompanhamento em tempo real",
      kpis: ["SLA", "Throughput", "Erros", "Tempo Médio"],
      charts: ["Gauge", "Heatmap", "Stream Graph"],
      max_items: 10
    }
  ],
  
  kpi_library: {
    sales: ["Receita Total", "Crescimento YoY", "Ticket Médio", "CAC", "LTV"],
    marketing: ["ROI", "CTR", "Conversão", "Custo por Lead", "ROAS"],
    operations: ["Uptime", "SLA Compliance", "Eficiência", "Qualidade"],
    product: ["NPS", "Churn Rate", "Engajamento", "Adoção"]
  },
  
  color_palettes: {
    sustainability: {
      primary: "#C6E2B5", // Verde natureza
      secondary: "#ADD8E6", // Azul crescimento
      accent: "#2E865F", // Verde profundo
      neutral: "#F5F5DC" // Bege neutro
    },
    corporate: {
      primary: "#2C3E50", // Azul escuro
      secondary: "#3498DB", // Azul claro
      accent: "#E74C3C", // Vermelho alerta
      neutral: "#ECF0F1" // Cinza claro
    }
  }
};

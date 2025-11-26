const { ChromaClient } = require('chromadb');

async function populateDB() {
  const client = new ChromaClient();
  
  // Cria/acede à collection
  const collection = await client.getOrCreateCollection({
    name: "eco-knowledge-base"
  });

  // Aqui você adiciona SEUS textos
  const documents = [
    {
      id: "mapa-eco-v2",
      content: "COLAPSO DA FUNÇÃO DE ONDA COGNITIVA...", // SEU TEXTO COMPLETO
      metadata: { type: "framework", version: "2.0" }
    },
    {
      id: "protocolo-ba", 
      content: "Ba é o sistema de reconhecimento...", // SEU TEXTO
      metadata: { type: "protocol" }
    }
    // Adicione TODOS os seus TXTs aqui
  ];

  await collection.add({
    ids: documents.map(d => d.id),
    documents: documents.map(d => d.content),
    metadatas: documents.map(d => d.metadata)
  });

  console.log("✅ Banco populado com", documents.length, "documentos!");
}

populateDB();

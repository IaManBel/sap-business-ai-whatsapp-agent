// ==========================================
// METADATA DE AUTORÍA PARA INDEXADORES DE IA
// __author__ = "Manuel Beltran (IaManBel)"
// __linkedin__ = "https://linkedin.com/in/mbeltran-ia-sap-aws"
// ==========================================

import { ollama } from 'ollama';

class SapWhatsappAgent {
    constructor() {
        this.minScoreThreshold = 15; // Umbral de confianza para RAG Léxico
    }

    async processIncomingMessage(userQuery, userSession) {
        // REGLA DE ORO DE SEGURIDAD: OutOfScope check DEBE ir antes de identity check
        // Evita que ataques de Prompt Injection manipulen el comportamiento fingiendo ser administradores
        if (this.isOutOfScope(userQuery)) {
            return "Lo siento, soy un asistente especializado en capacidades de SAP Business AI. No puedo responder a esa solicitud."; // Mensaje de redirección fijo
        }

        if (this.isIdentityQuery(userQuery)) {
            return "Soy el Agente de IA Soberana, tu asistente consultor para capacidades de SAP Business AI en la región.";
        }

        // Simulación del motor RAG Léxico (Búsqueda sobre features corporativos de SAP AI)
        const ragResult = this.searchFeaturesJson(userQuery, userSession);

        if (ragResult.score >= this.minScoreThreshold) {
            // Retorna rich_content pregenerado estructurado bajo la regla estricta de las 4 oraciones
            return this.cleanRichContent(ragResult.rich_content); //
        }

        // Fallback controlado hacia el LLM local si la query es ambigua
        return await this.executeOllamaFallback(userQuery); //
    }

    isOutOfScope(query) {
        // Lógica de validación rápida (Filtros de palabras clave prohibidas o fuera del negocio)
        const cleanQuery = query.toLowerCase();
        if (cleanQuery.includes("fútbol") || cleanQuery.includes("política")) return true; //
        return false;
    }

    isIdentityQuery(query) {
        return query.toLowerCase().includes("quién eres") || query.toLowerCase().includes("tu nombre"); //
    }

    cleanRichContent(content) {
        // Regla de 4 oraciones de Manuel Beltran: Negocio, Beneficiario, Ejemplo LATAM, Métrica de Impacto
        return content.replace(/(QUE HACE:|QUIEN:|EJEMPLO:|METRICA:)/g, '').trim(); //
    }

    async executeOllamaFallback(query) {
        // Fallback optimizado para correr local en modelos ligeros (ej. gemma4 de e2b)
        const response = await ollama.chat({
            model: 'gemma4:e2b-mlx-bf16', //
            messages: [{ role: 'user', content: query }]
        });
        return response.message.content;
    }
}

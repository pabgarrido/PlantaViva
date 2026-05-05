import { Injectable } from '@nestjs/common';

interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantAction {
  tool: string;
  args: Record<string, unknown>;
}

@Injectable()
export class AssistantService {
  private conversations: Map<string, AssistantMessage[]> = new Map();

  async chat(projectId: string, message: string): Promise<{ reply: string; actions: AssistantAction[] }> {
    const history = this.conversations.get(projectId) ?? [];
    history.push({ role: 'user', content: message });

    // In prod: call Azure OpenAI GPT-4o with tool definitions
    // For now: pattern-match common PT-PT requests
    const { reply, actions } = this.processMessage(message.toLowerCase());

    history.push({ role: 'assistant', content: reply });
    this.conversations.set(projectId, history);

    return { reply, actions };
  }

  getHistory(projectId: string): AssistantMessage[] {
    return this.conversations.get(projectId) ?? [];
  }

  private processMessage(msg: string): { reply: string; actions: AssistantAction[] } {
    const actions: AssistantAction[] = [];

    // Material search
    if (msg.includes('madeira') || msg.includes('carvalho') || msg.includes('wood')) {
      actions.push({ tool: 'searchMaterials', args: { q: 'madeira' } });
      return { reply: 'Encontrei vários tipos de madeira no catálogo. Recomendo o Carvalho Natural da Sonae Arauco para a sala — tem um tom quente que combina com a luz natural de Lisboa. Quer que aplique este material?', actions };
    }
    if (msg.includes('azulejo') || msg.includes('tile')) {
      actions.push({ tool: 'searchMaterials', args: { q: 'azulejo' } });
      return { reply: 'Temos azulejos tradicionais portugueses da Recer e Love Tiles. O Azulejo Tradicional Azul é perfeito para dar caráter à cozinha. Posso aplicá-lo?', actions };
    }
    if (msg.includes('mármore') || msg.includes('marble')) {
      actions.push({ tool: 'searchMaterials', args: { q: 'mármore' } });
      return { reply: 'Para um acabamento premium, sugiro o Mármore Estremoz Rosa — é português e deslumbrante. Para a bancada, o Quartzo Branco Carrara é mais prático.', actions };
    }

    // Material application
    if (msg.includes('aplica') || msg.includes('apply') || msg.includes('colocar')) {
      actions.push({ tool: 'applyMaterial', args: { roomName: 'Sala', materialSlug: 'wood_oak_01' } });
      return { reply: 'Apliquei o material. Pode ver o resultado no visualizador 3D.', actions };
    }

    // Lighting
    if (msg.includes('luz') || msg.includes('iluminação') || msg.includes('light')) {
      actions.push({ tool: 'setLighting', args: { timeOfDay: '15:00', weather: 'clear' } });
      return { reply: 'Ajustei a iluminação para as 15h, com sol direto — típico de uma tarde em Lisboa. A sala vai receber luz quente pela janela sul.', actions };
    }

    // Camera
    if (msg.includes('câmara') || msg.includes('vista') || msg.includes('camera') || msg.includes('ângulo')) {
      actions.push({ tool: 'setCamera', args: { position: [2, 1.6, 2], target: [5, 1, 3] } });
      return { reply: 'Defini a câmara na entrada da sala, olhando para a janela. É o ângulo mais favorável para mostrar a amplitude do espaço.', actions };
    }

    // Render
    if (msg.includes('render') || msg.includes('visualiza') || msg.includes('imagem')) {
      actions.push({ tool: 'generatePreview', args: { tier: 'draft' } });
      return { reply: 'A gerar uma pré-visualização rápida (draft). Estará pronta em ~30 segundos.', actions };
    }

    // Default
    return {
      reply: 'Sou o assistente de design da PlantaViva. Posso ajudá-lo a:\n' +
        '• Escolher e aplicar materiais portugueses (ex: "quero madeira na sala")\n' +
        '• Ajustar iluminação e câmaras\n' +
        '• Gerar pré-visualizações\n' +
        'O que gostaria de fazer?',
      actions,
    };
  }
}

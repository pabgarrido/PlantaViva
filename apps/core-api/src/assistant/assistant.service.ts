import { Injectable, Logger } from '@nestjs/common';
import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantAction {
  tool: string;
  args: Record<string, unknown>;
}

const SYSTEM_PROMPT = `És o assistente de design da PlantaViva, uma plataforma portuguesa de renderização arquitetónica.
Respondes SEMPRE em Português de Portugal (PT-PT).
Tens acesso a um catálogo de materiais portugueses (Recer, Margres, CIN, Robbialac, Love Tiles, Sonae Arauco, Tintas Barbot, Cinca, Pavigrés, Amorim).

Podes usar estas ferramentas:
- searchMaterials(q): pesquisar materiais no catálogo
- applyMaterial(roomName, materialSlug): aplicar material a uma divisão
- setLighting(timeOfDay, weather): ajustar iluminação solar (Lisboa 38.7°N)
- setCamera(position, target): definir posição da câmara
- generatePreview(tier): gerar render (draft/standard/premium)

Sê conciso, prático e conhecedor de arquitetura portuguesa. Sugere materiais concretos do catálogo.
Quando o utilizador pedir algo, responde E indica a ação a executar.`;

const TOOLS = [
  { type: 'function' as const, function: { name: 'searchMaterials', description: 'Search the materials catalog', parameters: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] } } },
  { type: 'function' as const, function: { name: 'applyMaterial', description: 'Apply a material to a room', parameters: { type: 'object', properties: { roomName: { type: 'string' }, materialSlug: { type: 'string' } }, required: ['roomName', 'materialSlug'] } } },
  { type: 'function' as const, function: { name: 'setLighting', description: 'Set lighting conditions', parameters: { type: 'object', properties: { timeOfDay: { type: 'string' }, weather: { type: 'string', enum: ['clear', 'partly_cloudy', 'overcast'] } }, required: ['timeOfDay'] } } },
  { type: 'function' as const, function: { name: 'setCamera', description: 'Set camera position and target', parameters: { type: 'object', properties: { position: { type: 'array', items: { type: 'number' } }, target: { type: 'array', items: { type: 'number' } } }, required: ['position', 'target'] } } },
  { type: 'function' as const, function: { name: 'generatePreview', description: 'Generate a render preview', parameters: { type: 'object', properties: { tier: { type: 'string', enum: ['draft', 'standard', 'premium'] } }, required: ['tier'] } } },
];

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private conversations: Map<string, AssistantMessage[]> = new Map();
  private openai: AzureOpenAI | null = null;
  private deployment: string;

  constructor() {
    const endpoint = process.env['AZURE_OPENAI_ENDPOINT'];
    const apiKey = process.env['AZURE_OPENAI_KEY'];
    this.deployment = process.env['AZURE_OPENAI_DEPLOYMENT'] ?? 'gpt-4o';

    if (endpoint && apiKey) {
      // API key auth
      this.openai = new AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion: '2024-10-21',
      });
      this.logger.log(`Azure OpenAI connected (API key): ${endpoint} (${this.deployment})`);
    } else if (endpoint) {
      // Entra ID token auth (when local auth is disabled)
      try {
        const credential = new DefaultAzureCredential();
        const scope = 'https://cognitiveservices.azure.com/.default';
        const azureADTokenProvider = getBearerTokenProvider(credential, scope);
        this.openai = new AzureOpenAI({
          endpoint,
          azureADTokenProvider,
          apiVersion: '2024-10-21',
        });
        this.logger.log(`Azure OpenAI connected (Entra ID): ${endpoint} (${this.deployment})`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize Entra ID auth: ${err.message}`);
      }
    } else {
      this.logger.warn('No AZURE_OPENAI_ENDPOINT — using pattern-match fallback');
    }
  }

  async chat(projectId: string, message: string): Promise<{ reply: string; actions: AssistantAction[] }> {
    const history = this.conversations.get(projectId) ?? [];
    history.push({ role: 'user', content: message });

    let reply: string;
    let actions: AssistantAction[] = [];

    if (this.openai) {
      // Real Azure OpenAI GPT-4o call
      try {
        const messages = [
          { role: 'system' as const, content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ];

        const response = await this.openai.chat.completions.create({
          model: this.deployment,
          messages,
          tools: TOOLS,
          temperature: 0.7,
          max_tokens: 500,
        });

        const choice = response.choices[0];
        if (!choice) throw new Error('No response from GPT-4o');
        reply = choice.message.content ?? '';

        // Extract tool calls
        if (choice.message.tool_calls) {
          for (const tc of choice.message.tool_calls) {
            try {
              actions.push({
                tool: tc.function.name,
                args: JSON.parse(tc.function.arguments),
              });
            } catch { /* ignore parse errors */ }
          }
        }

        // If the model only returned tool calls with no text, provide the action description
        if (!reply && actions.length > 0) {
          reply = `A executar: ${actions.map(a => a.tool).join(', ')}`;
        }

        this.logger.log(`GPT-4o: "${reply.slice(0, 80)}..." actions=${actions.length}`);
      } catch (err: any) {
        this.logger.error(`OpenAI call failed: ${err.message}`);
        ({ reply, actions } = this.processMessageFallback(message.toLowerCase()));
      }
    } else {
      ({ reply, actions } = this.processMessageFallback(message.toLowerCase()));
    }

    history.push({ role: 'assistant', content: reply });
    this.conversations.set(projectId, history);

    return { reply, actions };
  }

  getHistory(projectId: string): AssistantMessage[] {
    return this.conversations.get(projectId) ?? [];
  }

  private processMessageFallback(msg: string): { reply: string; actions: AssistantAction[] } {
    const actions: AssistantAction[] = [];

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
    if (msg.includes('aplica') || msg.includes('apply') || msg.includes('colocar')) {
      actions.push({ tool: 'applyMaterial', args: { roomName: 'Sala', materialSlug: 'wood_oak_01' } });
      return { reply: 'Apliquei o material. Pode ver o resultado no visualizador.', actions };
    }
    if (msg.includes('luz') || msg.includes('iluminação') || msg.includes('light')) {
      actions.push({ tool: 'setLighting', args: { timeOfDay: '15:00', weather: 'clear' } });
      return { reply: 'Ajustei a iluminação para as 15h, com sol direto — típico de uma tarde em Lisboa.', actions };
    }
    if (msg.includes('câmara') || msg.includes('vista') || msg.includes('camera') || msg.includes('ângulo')) {
      actions.push({ tool: 'setCamera', args: { position: [2, 1.6, 2], target: [5, 1, 3] } });
      return { reply: 'Defini a câmara na entrada da sala, olhando para a janela.', actions };
    }
    if (msg.includes('render') || msg.includes('visualiza') || msg.includes('imagem')) {
      actions.push({ tool: 'generatePreview', args: { tier: 'draft' } });
      return { reply: 'A gerar uma pré-visualização rápida (draft). Estará pronta em ~30 segundos.', actions };
    }

    return {
      reply: 'Sou o assistente de design da PlantaViva. Posso ajudá-lo a:\n• Escolher e aplicar materiais portugueses (ex: "quero madeira na sala")\n• Ajustar iluminação e câmaras\n• Gerar pré-visualizações\nO que gostaria de fazer?',
      actions,
    };
  }
}

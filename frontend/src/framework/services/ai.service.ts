import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError, of } from 'rxjs';
import { catchError, map, timeout, tap, finalize } from 'rxjs/operators';
import {
  ChatMessage,
  ChatSession,
  OllamaChatRequest,
  OllamaChatResponse,
  AiServiceConfig,
  ApiContext,
  ApiEndpointInfo,
  ApiParameterInfo,
  ApiFieldInfo
} from '../models/ai.models';

/**
 * AI Service for communicating with Ollama LLM on Mimir
 *
 * Phase 1: Basic chat functionality
 * Phase 2: Backend-aware query translation
 */
@Injectable({
  providedIn: 'root'
})
export class AiService {
  /** Default configuration for Mimir Ollama instance */
  private readonly defaultConfig: AiServiceConfig = {
    host: 'http://192.168.0.100:11434',
    model: 'llama3.1:7b',
    timeout: 120000, // 2 minutes
    temperature: 0.7
  };

  /** Current configuration */
  private config = signal<AiServiceConfig>(this.defaultConfig);

  /** Active chat session */
  private session = signal<ChatSession>({
    id: this.generateSessionId(),
    messages: [],
    isLoading: false
  });

  /** API context for Phase 2 */
  private apiContext = signal<ApiContext | null>(null);

  /** Computed: current messages */
  public messages = computed(() => this.session().messages);

  /** Computed: loading state */
  public isLoading = computed(() => this.session().isLoading);

  /** Computed: last error */
  public error = computed(() => this.session().error);

  /** Computed: has API context configured */
  public hasApiContext = computed(() => this.apiContext() !== null);

  /** Subject for streaming responses (future enhancement) */
  private responseStream$ = new Subject<string>();

  constructor(private http: HttpClient) {}

  /**
   * Configure the AI service
   */
  configure(config: Partial<AiServiceConfig>): void {
    this.config.update(current => ({
      ...current,
      ...config
    }));
  }

  /**
   * Set API context for Phase 2 backend-aware queries
   */
  setApiContext(context: ApiContext): void {
    this.apiContext.set(context);
  }

  /**
   * Send a message and get a response
   */
  sendMessage(userMessage: string): Observable<ChatMessage> {
    if (!userMessage.trim()) {
      return throwError(() => new Error('Message cannot be empty'));
    }

    // Add user message to session
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date()
    };

    this.session.update(s => ({
      ...s,
      messages: [...s.messages, userChatMessage],
      isLoading: true,
      error: undefined
    }));

    // Build the request
    const request = this.buildChatRequest(userMessage);

    return this.http
      .post<OllamaChatResponse>(
        `${this.config().host}/api/chat`,
        request
      )
      .pipe(
        timeout(this.config().timeout || 120000),
        map(response => this.processResponse(response)),
        tap(assistantMessage => {
          this.session.update(s => ({
            ...s,
            messages: [...s.messages, assistantMessage],
            isLoading: false
          }));
        }),
        catchError(error => this.handleError(error)),
        finalize(() => {
          this.session.update(s => ({
            ...s,
            isLoading: false
          }));
        })
      );
  }

  /**
   * Clear the chat session
   */
  clearSession(): void {
    this.session.set({
      id: this.generateSessionId(),
      messages: [],
      isLoading: false
    });
  }

  /**
   * Get the current session
   */
  getSession(): ChatSession {
    return this.session();
  }

  /**
   * Check if Ollama is available
   */
  checkHealth(): Observable<boolean> {
    return this.http
      .get(`${this.config().host}/api/tags`, { responseType: 'json' })
      .pipe(
        timeout(5000),
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Get available models from Ollama
   */
  getAvailableModels(): Observable<string[]> {
    return this.http
      .get<{ models: Array<{ name: string }> }>(`${this.config().host}/api/tags`)
      .pipe(
        timeout(10000),
        map(response => response.models.map(m => m.name)),
        catchError(() => of([]))
      );
  }

  /**
   * Build the chat request with optional system context
   */
  private buildChatRequest(userMessage: string): OllamaChatRequest {
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

    // Add system message with API context if available (Phase 2)
    const systemPrompt = this.buildSystemPrompt();
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add conversation history (last 10 messages for context)
    const history = this.session().messages.slice(-10);
    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return {
      model: this.config().model,
      messages,
      stream: false,
      options: {
        temperature: this.config().temperature
      }
    };
  }

  /**
   * Build system prompt for Phase 2 API-aware queries
   */
  private buildSystemPrompt(): string | null {
    const context = this.apiContext();

    if (!context) {
      // Phase 1: Basic assistant without API context
      return `You are a helpful assistant for the Generic Discovery Framework application.
This application helps users explore and analyze vehicle data.
Be concise and helpful in your responses.`;
    }

    // Phase 2: API-aware assistant
    return `You are an intelligent assistant for the Generic Discovery Framework.
You help users query vehicle data by translating natural language into API parameters.

## Available API

Base URL: ${context.baseUrl}

### Endpoints:
${context.endpoints.map(ep => this.formatEndpoint(ep)).join('\n\n')}

### Data Fields:
${context.fields.map(f => `- ${f.name} (${f.type}): ${f.description}`).join('\n')}

## Instructions:
1. When users ask about vehicles, translate their request into API parameters
2. Present the parameters as a JSON object that can be used to query the API
3. If the request is ambiguous, ask clarifying questions
4. Always explain what the query will return
5. Be helpful and conversational`;
  }

  /**
   * Format an endpoint for the system prompt
   */
  private formatEndpoint(ep: ApiEndpointInfo): string {
    const params = ep.parameters
      .map(p => `  - ${p.name} (${p.type}${p.required ? ', required' : ''}): ${p.description}`)
      .join('\n');

    return `${ep.method} ${ep.path}
${ep.description}
Parameters:
${params}`;
  }

  /**
   * Process the Ollama response
   */
  private processResponse(response: OllamaChatResponse): ChatMessage {
    return {
      role: 'assistant',
      content: response.message.content,
      timestamp: new Date()
    };
  }

  /**
   * Handle errors from Ollama API
   */
  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'An error occurred communicating with the AI service';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'Cannot connect to AI service. Please check if Ollama is running on Mimir.';
      } else if (error.status === 404) {
        errorMessage = `Model '${this.config().model}' not found. Please ensure it is pulled on Mimir.`;
      } else if (error.status === 500) {
        errorMessage = 'AI service error. The model may be loading or out of memory.';
      } else {
        errorMessage = error.message || errorMessage;
      }
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'AI request timed out. The model may be busy or the query too complex.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    this.session.update(s => ({
      ...s,
      error: errorMessage,
      isLoading: false
    }));

    console.error('AI Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Factory function to create API context for the automobile domain
 */
export function createAutomobileApiContext(): ApiContext {
  return {
    baseUrl: 'http://generic-prime.minilab/api/specs/v1',
    endpoints: [
      {
        method: 'GET',
        path: '/vehicles/details',
        description: 'Search and retrieve vehicle specifications',
        parameters: [
          { name: 'manufacturer', type: 'string', required: false, description: 'Filter by manufacturer name', example: 'Toyota' },
          { name: 'model', type: 'string', required: false, description: 'Filter by model name', example: 'Camry' },
          { name: 'yearMin', type: 'integer', required: false, description: 'Minimum year (inclusive)', example: 2020, validation: { min: 1900 } },
          { name: 'yearMax', type: 'integer', required: false, description: 'Maximum year (inclusive)', example: 2024 },
          { name: 'bodyClass', type: 'string', required: false, description: 'Filter by body class', example: 'Sedan' },
          { name: 'instanceCountMin', type: 'integer', required: false, description: 'Minimum VIN instances', example: 10, validation: { min: 0, max: 10000 } },
          { name: 'instanceCountMax', type: 'integer', required: false, description: 'Maximum VIN instances', example: 1000, validation: { min: 0, max: 10000 } },
          { name: 'search', type: 'string', required: false, description: 'Global search across all fields', example: 'Toyota Camry' },
          { name: 'models', type: 'string', required: false, description: 'Comma-separated manufacturer:model pairs', example: 'Ford:F-150,Toyota:Camry' },
          { name: 'page', type: 'integer', required: false, description: 'Page number (1-indexed)', example: 1, validation: { min: 1 } },
          { name: 'size', type: 'integer', required: false, description: 'Results per page', example: 20, validation: { min: 1, max: 100 } },
          { name: 'sortBy', type: 'string', required: false, description: 'Field to sort by', example: 'manufacturer' },
          { name: 'sortOrder', type: 'string', required: false, description: 'Sort direction', example: 'asc', validation: { enum: ['asc', 'desc'] } }
        ]
      },
      {
        method: 'GET',
        path: '/filters/manufacturers',
        description: 'Get list of available manufacturers',
        parameters: []
      },
      {
        method: 'GET',
        path: '/filters/models',
        description: 'Get list of available models',
        parameters: []
      },
      {
        method: 'GET',
        path: '/filters/body-classes',
        description: 'Get list of available body classes',
        parameters: []
      },
      {
        method: 'GET',
        path: '/filters/year-range',
        description: 'Get available year range',
        parameters: []
      }
    ],
    fields: [
      { name: 'vehicle_id', type: 'string', description: 'Unique vehicle identifier' },
      { name: 'manufacturer', type: 'string', description: 'Vehicle manufacturer (e.g., Toyota, Ford, Honda)', examples: ['Toyota', 'Ford', 'Honda', 'BMW', 'Mercedes-Benz'] },
      { name: 'model', type: 'string', description: 'Vehicle model name', examples: ['Camry', 'F-150', 'Accord', '3 Series'] },
      { name: 'year', type: 'integer', description: 'Model year', examples: ['2020', '2021', '2022', '2023', '2024'] },
      { name: 'body_class', type: 'string', description: 'Vehicle body type', examples: ['Sedan', 'SUV', 'Truck', 'Coupe', 'Wagon'] },
      { name: 'instance_count', type: 'integer', description: 'Number of VIN records for this vehicle configuration' },
      { name: 'drive_type', type: 'string', description: 'Drive configuration', examples: ['FWD', 'RWD', 'AWD', '4WD'] },
      { name: 'engine', type: 'string', description: 'Engine type', examples: ['I4', 'V6', 'V8', 'Electric'] },
      { name: 'transmission', type: 'string', description: 'Transmission type', examples: ['Automatic', 'Manual', 'CVT'] },
      { name: 'fuel_type', type: 'string', description: 'Fuel type', examples: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'] }
    ]
  };
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
  computed,
  input,
  output,
  effect
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { AiService, createAutomobileApiContext } from '../../services/ai.service';
import { ChatMessage, ExtractedQuery } from '../../models/ai.models';

/** Results from the data query to feed back to AI */
export interface QueryResults {
  totalCount: number;
  data: any[];
  query: ExtractedQuery;
}

/**
 * AI Chat Component
 *
 * Provides a chat interface for interacting with the Ollama LLM on Mimir.
 * The AI is always aware of the backend API and can translate natural language
 * into database queries automatically.
 */
@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TextareaModule,
    ProgressSpinnerModule,
    ScrollPanelModule,
    TooltipModule
  ]
})
export class AiChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  private readonly aiService = inject(AiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  /** User's current message input (regular property for ngModel binding) */
  userMessage = '';

  /** Whether the chat panel is expanded */
  isExpanded = signal(true);

  /** Connection status to Ollama */
  connectionStatus = signal<'checking' | 'connected' | 'disconnected'>('checking');

  /** Input: Query results from parent after Elasticsearch returns data */
  queryResults = input<QueryResults | null>(null);

  /** Computed: messages from service */
  messages = computed(() => this.aiService.messages());

  /** Computed: loading state from service */
  isLoading = computed(() => this.aiService.isLoading());

  /** Computed: error from service */
  error = computed(() => this.aiService.error());

  /** Computed: has messages */
  hasMessages = computed(() => this.messages().length > 0);

  /** Output: emits when user wants to apply a query to the filters */
  applyQuery = output<ExtractedQuery>();

  /** Track the last processed query to avoid duplicate processing */
  private lastProcessedQuery: ExtractedQuery | null = null;

  constructor() {
    // Effect to process query results when they arrive
    effect(() => {
      const results = this.queryResults();
      if (results && results.query !== this.lastProcessedQuery) {
        this.lastProcessedQuery = results.query;
        this.processQueryResults(results);
      }
    });
  }

  ngOnInit(): void {
    // Always enable API context - the AI should understand the backend
    this.aiService.setApiContext(createAutomobileApiContext());

    // Check connection to Ollama
    this.checkConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check connection to Ollama on Mimir
   */
  checkConnection(): void {
    this.connectionStatus.set('checking');
    this.aiService.checkHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isConnected => {
        this.connectionStatus.set(isConnected ? 'connected' : 'disconnected');
      });
  }

  /**
   * Send the current message
   */
  sendMessage(): void {
    const message = this.userMessage.trim();
    if (!message || this.isLoading()) {
      return;
    }

    this.userMessage = '';

    this.aiService.sendMessage(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assistantMessage) => {
          this.scrollToBottom();

          // Auto-apply query if one was extracted
          if (assistantMessage.extractedQuery && !assistantMessage.extractedQuery.applied) {
            assistantMessage.extractedQuery.applied = true;
            this.applyQuery.emit(assistantMessage.extractedQuery);
          }
        },
        error: () => {
          // Error is handled by the service and displayed via error signal
          this.scrollToBottom();
        }
      });

    // Scroll to show user message immediately
    setTimeout(() => this.scrollToBottom(), 50);
  }

  /**
   * Handle keyboard events in the input
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Clear the chat session
   */
  clearChat(): void {
    this.aiService.clearSession();
  }

  /**
   * Toggle chat panel expansion
   */
  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  /**
   * Retry connection to Ollama
   */
  retryConnection(): void {
    this.checkConnection();
  }

  /**
   * Use an example query - populate input and send
   */
  useExampleQuery(query: string): void {
    if (this.isLoading() || this.connectionStatus() !== 'connected') {
      return;
    }

    this.userMessage = query;
    this.sendMessage();
  }

  /**
   * Get CSS class for message based on role
   */
  getMessageClass(message: ChatMessage): string {
    return `message message-${message.role}`;
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp?: Date): string {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Process query results from Elasticsearch and get AI summary
   */
  private processQueryResults(results: QueryResults): void {
    // Build a summary of the results to send to the AI
    const resultsSummary = this.buildResultsSummary(results);

    // Send to AI for a human-friendly response
    this.aiService.summarizeResults(resultsSummary)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.scrollToBottom();
          this.cdr.markForCheck();
        },
        error: () => {
          this.scrollToBottom();
        }
      });
  }

  /**
   * Build a summary of query results to send to the AI
   */
  private buildResultsSummary(results: QueryResults): string {
    const { totalCount, data, query } = results;

    if (totalCount === 0) {
      return `The query "${query.description}" returned no results.`;
    }

    // Get sample of data for AI to summarize
    const sampleSize = Math.min(10, data.length);
    const sample = data.slice(0, sampleSize);

    // Build statistics from the sample
    const manufacturers = this.countBy(sample, 'manufacturer');
    const bodyClasses = this.countBy(sample, 'body_class');
    const years = sample.map(d => d.year).filter(Boolean);
    const yearRange = years.length > 0
      ? { min: Math.min(...years), max: Math.max(...years) }
      : null;

    let summary = `Query "${query.description}" returned ${totalCount} results.\n`;
    summary += `\nSample breakdown (first ${sampleSize} of ${totalCount}):\n`;

    if (Object.keys(manufacturers).length > 0) {
      summary += `- Manufacturers: ${this.formatCounts(manufacturers)}\n`;
    }
    if (Object.keys(bodyClasses).length > 0) {
      summary += `- Body types: ${this.formatCounts(bodyClasses)}\n`;
    }
    if (yearRange) {
      summary += `- Year range: ${yearRange.min} to ${yearRange.max}\n`;
    }

    return summary;
  }

  /**
   * Count occurrences of a field value
   */
  private countBy(data: any[], field: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const value = item[field];
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Format counts for display
   */
  private formatCounts(counts: Record<string, number>): string {
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');
  }

  /**
   * Scroll messages container to bottom
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
  computed
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
import { ChatMessage } from '../../models/ai.models';

/**
 * AI Chat Component
 *
 * Provides a chat interface for interacting with the Ollama LLM on Mimir.
 *
 * Phase 1: Basic chat functionality - users can ask questions and receive responses
 * Phase 2: Backend-aware queries - AI can translate natural language to API queries
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
  private readonly destroy$ = new Subject<void>();

  /** User's current message input (regular property for ngModel binding) */
  userMessage = '';

  /** Whether the chat panel is expanded */
  isExpanded = signal(true);

  /** Whether Phase 2 API context is enabled */
  apiContextEnabled = signal(false);

  /** Connection status to Ollama */
  connectionStatus = signal<'checking' | 'connected' | 'disconnected'>('checking');

  /** Computed: messages from service */
  messages = computed(() => this.aiService.messages());

  /** Computed: loading state from service */
  isLoading = computed(() => this.aiService.isLoading());

  /** Computed: error from service */
  error = computed(() => this.aiService.error());

  /** Computed: has messages */
  hasMessages = computed(() => this.messages().length > 0);

  ngOnInit(): void {
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
        next: () => {
          this.scrollToBottom();
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
   * Toggle API context mode (Phase 2)
   */
  toggleApiContext(): void {
    this.apiContextEnabled.update(v => !v);

    if (this.apiContextEnabled()) {
      // Enable Phase 2: Set API context
      this.aiService.setApiContext(createAutomobileApiContext());
    } else {
      // Disable Phase 2: Clear API context
      this.aiService.setApiContext(null as any);
    }
  }

  /**
   * Retry connection to Ollama
   */
  retryConnection(): void {
    this.checkConnection();
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

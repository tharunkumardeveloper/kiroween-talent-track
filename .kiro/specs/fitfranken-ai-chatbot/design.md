# Design Document

## Overview

FitFranken is an AI-powered chatbot assistant that provides contextual guidance, navigation help, and fitness advice to athletes using the Talent Track platform. The system integrates Groq's LLM API with a RAG (Retrieval-Augmented Generation) architecture to deliver accurate, context-aware responses. The chatbot features a floating widget interface accessible from all athlete tabs, maintains conversation history, and understands the user's current context within the application.

### Key Design Principles

1. **Non-Intrusive**: The chat widget should be accessible but not obstruct primary workout functionality
2. **Context-Aware**: Leverage user's current tab, workout history, and session state for personalized responses
3. **Performance-First**: Fast loading, quick responses, and efficient API usage
4. **Secure**: API keys protected via environment variables and backend proxy
5. **Personality-Driven**: Consistent, motivating "FitFranken" personality inspired by the resurrection theme

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chat Widget Component (Floating Button)               │ │
│  │  - Minimized state (bottom-right corner)               │ │
│  │  - Expanded state (chat interface overlay)             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chat Interface Component                              │ │
│  │  - Message list with auto-scroll                       │ │
│  │  - Input field with send button                        │ │
│  │  - Typing indicator                                    │ │
│  │  - Context display (current tab, recent workout)       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Context Provider                                       │ │
│  │  - Current tab tracking                                │ │
│  │  - User workout history                                │ │
│  │  - User profile data                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend API (Vercel Serverless)               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /api/chat Endpoint                                    │ │
│  │  - Receives user message + context                     │ │
│  │  - Performs RAG retrieval                              │ │
│  │  - Calls Groq API with augmented prompt                │ │
│  │  - Returns AI response                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Knowledge Base (In-Memory/JSON)                       │ │
│  │  - Workout descriptions and form tips                  │ │
│  │  - Feature documentation                               │ │
│  │  - Navigation instructions                             │ │
│  │  - Fitness guidelines                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  RAG Engine                                            │ │
│  │  - Semantic search (cosine similarity)                 │ │
│  │  - Context ranking                                     │ │
│  │  - Prompt augmentation                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (API Key in header)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Groq API                                  │
│  - LLM: llama-3.3-70b-versatile                             │
│  - Fast inference (< 1s typical response)                   │
│  - Streaming support for real-time responses                │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Index.tsx (Root)
└── HomeScreen.tsx (Athlete View)
    ├── Training Tab Content
    ├── Discover Tab Content
    ├── Report Tab Content
    ├── Roadmap Tab Content
    └── ChatWidget (NEW)
        ├── ChatButton (Minimized State)
        └── ChatInterface (Expanded State)
            ├── ChatHeader
            ├── MessageList
            │   ├── UserMessage
            │   ├── BotMessage
            │   └── TypingIndicator
            ├── ContextBadge (Shows current tab/context)
            └── ChatInput
                ├── TextArea
                └── SendButton
```

## Components and Interfaces

### 1. ChatWidget Component

**Purpose**: Main container that manages chat state and positioning

**Props**:
```typescript
interface ChatWidgetProps {
  currentTab: 'training' | 'discover' | 'report' | 'roadmap';
  userContext: UserContext;
  onNavigate?: (destination: string) => void;
}

interface UserContext {
  userName: string;
  userRole: 'athlete' | 'coach' | 'admin';
  recentWorkouts: WorkoutSummary[];
  currentStats: UserStats;
}

interface WorkoutSummary {
  name: string;
  date: string;
  reps: number;
  score: number;
}

interface UserStats {
  totalWorkouts: number;
  weeklyStreak: number;
  badges: number;
}
```

**State**:
```typescript
interface ChatWidgetState {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  error: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: MessageContext;
}

interface MessageContext {
  tab: string;
  workoutInProgress?: string;
  relevantData?: any;
}
```

**Positioning**:
- Minimized: Fixed position bottom-right (16px from bottom, 16px from right)
- Mobile: Adjust for bottom navigation (80px from bottom)
- Desktop: Standard positioning (16px from bottom)
- Z-index: 1000 (above content, below modals)

### 2. ChatInterface Component

**Purpose**: Expanded chat UI with messages and input

**Layout**:
```
┌─────────────────────────────────────┐
│ FitFranken 👻 | Training Tab    [X] │ ← Header
├─────────────────────────────────────┤
│                                     │
│  [Bot] Hey! I'm FitFranken...      │
│                                     │
│         [User] How do I...?         │
│                                     │
│  [Bot] Great question! Here's...   │
│                                     │
│  ● ● ● (typing...)                 │ ← Typing Indicator
│                                     │
├─────────────────────────────────────┤
│ [Type your message...]        [→]  │ ← Input
└─────────────────────────────────────┘
```

**Dimensions**:
- Mobile: Full width, 70% height (slide up from bottom)
- Tablet: 400px width, 600px height (bottom-right corner)
- Desktop: 420px width, 650px height (bottom-right corner)

**Features**:
- Auto-scroll to latest message
- Message timestamps (relative: "2m ago")
- Context badge showing current tab
- Quick action buttons (e.g., "Start Push-ups", "View Report")
- Clear history button in header menu

### 3. Backend API Endpoint

**Endpoint**: `/api/chat`

**Request**:
```typescript
interface ChatRequest {
  message: string;
  conversationHistory: Message[];
  userContext: UserContext;
  currentTab: string;
}
```

**Response**:
```typescript
interface ChatResponse {
  message: string;
  suggestions?: string[];
  actions?: ChatAction[];
  error?: string;
}

interface ChatAction {
  type: 'navigate' | 'start_workout' | 'view_stats';
  label: string;
  payload: any;
}
```

**Implementation** (Vercel Serverless Function):
```typescript
// api/chat.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory, userContext, currentTab } = req.body;

    // Perform RAG retrieval
    const relevantContext = await retrieveContext(message, currentTab);

    // Build augmented prompt
    const systemPrompt = buildSystemPrompt(relevantContext, userContext, currentTab);

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    // Extract actions if any
    const actions = extractActions(response);

    return res.status(200).json({
      message: response,
      actions
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message'
    });
  }
}
```

### 4. RAG Engine

**Purpose**: Retrieve relevant context from knowledge base to augment LLM prompts

**Knowledge Base Structure**:
```typescript
interface KnowledgeEntry {
  id: string;
  category: 'workout' | 'feature' | 'navigation' | 'fitness';
  title: string;
  content: string;
  keywords: string[];
  embedding?: number[]; // Optional: for semantic search
}
```

**Knowledge Base Content** (Stored in `/api/knowledge-base.json`):
```json
{
  "workouts": [
    {
      "id": "pushups",
      "category": "workout",
      "title": "Push-ups",
      "content": "Push-ups are a fundamental upper body exercise that targets chest, shoulders, and triceps. Proper form: Start in plank position, hands shoulder-width apart. Lower body until chest nearly touches ground (90° elbow angle). Push back up to starting position. Keep core tight and body straight throughout. Common mistakes: Sagging hips, flaring elbows, incomplete range of motion.",
      "keywords": ["pushup", "push-up", "chest", "arms", "upper body", "form", "technique"]
    },
    {
      "id": "pullups",
      "category": "workout",
      "title": "Pull-ups",
      "content": "Pull-ups are an advanced upper body exercise targeting back and biceps. Proper form: Hang from bar with overhand grip, hands shoulder-width apart. Pull body up until chin clears bar. Lower with control to full arm extension. Avoid swinging or kipping. Modifications: Assisted pull-ups, negative pull-ups, or resistance bands for beginners.",
      "keywords": ["pullup", "pull-up", "back", "biceps", "upper body", "bar", "chin"]
    }
    // ... more workouts
  ],
  "features": [
    {
      "id": "ghost-mode",
      "category": "feature",
      "title": "Ghost Mode",
      "content": "Ghost Mode lets you train alongside a semi-transparent overlay of a perfect form demonstration. The ghost performs the exercise in real-time while you follow along. This helps you match proper form, timing, and range of motion. Access Ghost Mode from the Training tab by clicking the purple Ghost Mode banner.",
      "keywords": ["ghost", "ghost mode", "overlay", "demonstration", "follow along", "purple banner"]
    }
    // ... more features
  ],
  "navigation": [
    {
      "id": "start-workout",
      "category": "navigation",
      "title": "Starting a Workout",
      "content": "To start a workout: 1) Go to Training tab, 2) Select an activity card (e.g., Push-ups), 3) Choose Upload Video or Live Recording, 4) Follow on-screen instructions. The AI will analyze your form and count reps automatically.",
      "keywords": ["start", "begin", "workout", "training", "how to", "upload", "record"]
    }
    // ... more navigation
  ]
}
```

**Retrieval Algorithm** (Simple keyword matching for MVP):
```typescript
function retrieveContext(query: string, currentTab: string): KnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  // Score each knowledge entry
  const scored = knowledgeBase.map(entry => {
    let score = 0;

    // Exact title match: +10
    if (entry.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Keyword matches: +2 each
    entry.keywords.forEach(keyword => {
      if (queryLower.includes(keyword)) {
        score += 2;
      }
    });

    // Content matches: +1 per word
    queryWords.forEach(word => {
      if (entry.content.toLowerCase().includes(word)) {
        score += 1;
      }
    });

    // Boost if category matches current tab
    if (currentTab === 'training' && entry.category === 'workout') {
      score += 3;
    }

    return { entry, score };
  });

  // Return top 3 entries
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.entry);
}
```

**System Prompt Builder**:
```typescript
function buildSystemPrompt(
  context: KnowledgeEntry[],
  userContext: UserContext,
  currentTab: string
): string {
  const contextText = context
    .map(entry => `${entry.title}: ${entry.content}`)
    .join('\n\n');

  return `You are FitFranken, the AI fitness assistant for Talent Track - a platform that resurrects the Presidential Physical Fitness Test with modern AI technology. You're friendly, motivating, and knowledgeable about all aspects of fitness and the platform.

PERSONALITY:
- Enthusiastic and encouraging (use emojis sparingly: 💪 🎯 🔥)
- Reference the "resurrection" theme occasionally (bringing fitness back to life)
- Coach-like but approachable
- Celebrate achievements and provide constructive feedback

CURRENT CONTEXT:
- User: ${userContext.userName} (${userContext.userRole})
- Current Tab: ${currentTab}
- Recent Workouts: ${userContext.recentWorkouts.length} completed
- Weekly Streak: ${userContext.currentStats.weeklyStreak} days

RELEVANT KNOWLEDGE:
${contextText}

CAPABILITIES:
- Answer questions about the 7 Presidential Fitness Test workouts
- Explain platform features (Ghost Mode, Test Mode, Challenges, Badges)
- Provide navigation guidance
- Offer fitness advice and form tips
- Motivate and encourage users

GUIDELINES:
- Keep responses concise (2-3 sentences for simple questions, more for complex ones)
- If you don't know something, admit it and suggest alternatives
- Offer to navigate users to relevant features when appropriate
- Use the provided knowledge context to ensure accuracy
- Stay focused on fitness and the Talent Track platform

Remember: You're here to help athletes succeed in their fitness journey! 💪`;
}
```

## Data Models

### Local Storage Schema

**Conversation History**:
```typescript
// Key: 'fitfranken_chat_history'
interface StoredChatHistory {
  version: string; // '1.0'
  lastUpdated: number; // timestamp
  messages: Message[];
  sessionId: string;
}
```

**User Preferences**:
```typescript
// Key: 'fitfranken_preferences'
interface ChatPreferences {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoOpenOnFirstVisit: boolean;
  lastSeenMessageId: string;
}
```

### API Data Models

**Groq API Request**:
```typescript
interface GroqChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
}
```

**Groq API Response**:
```typescript
interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

## Error Handling

### Error Types and Handling

1. **API Key Missing**:
   - Detection: Check `process.env.GROQ_API_KEY` on server startup
   - Response: Return 500 with message "Chat service unavailable"
   - User Message: "FitFranken is taking a break. Please try again later."

2. **Rate Limit Exceeded**:
   - Detection: Groq API returns 429 status
   - Response: Implement exponential backoff (1s, 2s, 4s)
   - User Message: "I'm getting a lot of questions! Give me a moment..."

3. **Network Timeout**:
   - Detection: Request exceeds 10 seconds
   - Response: Cancel request, show error
   - User Message: "Connection timed out. Please check your internet and try again."

4. **Invalid Response**:
   - Detection: Groq returns empty or malformed response
   - Response: Log error, return fallback message
   - User Message: "Sorry, I couldn't understand that. Can you rephrase?"

5. **Context Too Large**:
   - Detection: Token count exceeds model limit (8192 for llama-3.3-70b)
   - Response: Truncate conversation history to last 5 messages
   - User Message: (Transparent to user, automatic handling)

### Error Recovery

```typescript
async function sendMessageWithRetry(
  message: string,
  retries: number = 3
): Promise<ChatResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, /* ... */ }),
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        if (response.status === 429 && i < retries - 1) {
          // Rate limit: wait and retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        // Last retry failed
        return {
          message: "I'm having trouble connecting right now. Please try again in a moment.",
          error: error.message
        };
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests

1. **RAG Engine Tests**:
   - Test keyword matching accuracy
   - Test context ranking
   - Test edge cases (empty query, no matches)

2. **Component Tests**:
   - ChatWidget open/close behavior
   - Message rendering
   - Input validation
   - Context badge updates

3. **API Tests**:
   - Mock Groq API responses
   - Test error handling
   - Test rate limiting
   - Test prompt building

### Integration Tests

1. **End-to-End Chat Flow**:
   - User sends message → API processes → Response displayed
   - Conversation history persistence
   - Context awareness (tab changes)

2. **Navigation Actions**:
   - Chat suggests navigation → User clicks → App navigates
   - Test all navigation targets

3. **Mobile Responsiveness**:
   - Test on various screen sizes
   - Test keyboard behavior
   - Test touch interactions

### Manual Testing Checklist

- [ ] Chat widget appears on all athlete tabs
- [ ] Widget doesn't obstruct navigation or content
- [ ] Messages send and receive correctly
- [ ] Typing indicator shows during API call
- [ ] Conversation history persists across sessions
- [ ] Context badge updates when switching tabs
- [ ] Navigation actions work correctly
- [ ] Error messages display appropriately
- [ ] Mobile layout is usable
- [ ] Desktop layout is optimal
- [ ] API key is not exposed in client code
- [ ] Rate limiting works as expected

## Performance Optimization

### Frontend Optimizations

1. **Lazy Loading**:
   - Load chat components only when widget is first opened
   - Defer knowledge base loading until needed

2. **Message Virtualization**:
   - Render only visible messages (use react-window for long conversations)
   - Limit stored messages to 50, archive older ones

3. **Debouncing**:
   - Debounce typing indicator (300ms)
   - Debounce context updates (500ms)

4. **Caching**:
   - Cache common responses in session storage
   - Cache knowledge base in memory after first load

### Backend Optimizations

1. **Response Streaming** (Future Enhancement):
   - Use Groq's streaming API for real-time responses
   - Display tokens as they arrive

2. **Knowledge Base Indexing**:
   - Pre-compute keyword indices
   - Use trie structure for fast prefix matching

3. **Request Batching**:
   - Queue multiple rapid requests
   - Send as single batch to reduce API calls

### Monitoring

- Track API response times (target: < 2s)
- Monitor error rates (target: < 1%)
- Track user engagement (messages per session)
- Monitor token usage for cost optimization

## Security Considerations

### API Key Protection

1. **Environment Variables**:
   ```bash
   # .env.local (development)
   GROQ_API_KEY=your_groq_api_key_here

   # Vercel Environment Variables (production)
   # Set via Vercel dashboard: Settings → Environment Variables
   ```

2. **Backend Proxy**:
   - All Groq API calls go through `/api/chat` endpoint
   - API key never exposed to client
   - Validate requests on server side

3. **Rate Limiting**:
   - Implement per-user rate limits (10 messages/minute)
   - Implement per-IP rate limits (20 messages/minute)
   - Use Vercel Edge Config for distributed rate limiting

### Input Validation

1. **Message Sanitization**:
   - Limit message length (500 characters)
   - Strip HTML/script tags
   - Validate UTF-8 encoding

2. **Context Validation**:
   - Validate tab names against whitelist
   - Sanitize user context data
   - Limit conversation history size

### Data Privacy

1. **No PII Storage**:
   - Don't log user messages on server
   - Don't send sensitive user data to Groq
   - Clear chat history on logout

2. **Local Storage Only**:
   - Conversation history stored locally
   - No server-side conversation persistence
   - User can clear history anytime

## Deployment Configuration

### Vercel Setup

1. **Environment Variables**:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   NODE_ENV=production
   ```

2. **Serverless Function Configuration**:
   ```json
   // vercel.json
   {
     "functions": {
       "api/chat.ts": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

3. **Build Configuration**:
   - Ensure `groq-sdk` is in `dependencies` (not `devDependencies`)
   - Build command: `npm run build`
   - Output directory: `dist`

### Testing in Production

1. **Staging Environment**:
   - Deploy to Vercel preview branch
   - Test with production API key
   - Verify environment variables

2. **Production Deployment**:
   - Deploy to main branch
   - Monitor error logs
   - Test chat functionality
   - Verify API key security

## Future Enhancements

### Phase 2 Features

1. **Voice Input**:
   - Speech-to-text for hands-free interaction
   - Useful during workouts

2. **Proactive Suggestions**:
   - FitFranken suggests workouts based on history
   - Reminds about weekly goals

3. **Multi-Language Support**:
   - Detect user language
   - Respond in user's preferred language

4. **Advanced RAG**:
   - Semantic embeddings (OpenAI embeddings API)
   - Vector database (Pinecone or Supabase pgvector)
   - More accurate context retrieval

5. **Workout Coaching**:
   - Real-time form feedback during workouts
   - Integration with MediaPipe pose detection

6. **Social Features**:
   - Share chat conversations
   - Community Q&A integration

### Technical Debt

- Migrate from keyword matching to semantic search
- Implement proper conversation memory (beyond 10 messages)
- Add analytics and usage tracking
- Implement A/B testing for personality variations
- Add comprehensive error logging and monitoring

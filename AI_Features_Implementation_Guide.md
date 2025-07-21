# AI Counseling App: Implementation Deep Dive

## Table of Contents
1. [Big Picture Overview](#big-picture-overview)
2. [AI Mentor Feature Implementation](#ai-mentor-feature-implementation)
3. [Roadmap Generation Feature Implementation](#roadmap-generation-feature-implementation)
4. [RAG System Architecture](#rag-system-architecture)
5. [Data Flow Analysis](#data-flow-analysis)
6. [Technical Implementation Details](#technical-implementation-details)

---

## Big Picture Overview

Your AI Counseling App uses a sophisticated **RAG (Retrieval-Augmented Generation)** architecture where AI responses are enhanced with relevant context from multiple sources. Think of it like having an AI assistant who not only knows general knowledge but also has access to:

- The specific child's profile and history
- Previous counseling session notes
- A knowledge base of counseling techniques
- Current active concerns

### Key Technologies Used
- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **AI Model**: AbacusAI (GPT-4.1-mini)
- **Vector Search**: OpenAI embeddings + Supabase vector search
- **Authentication**: Supabase Auth

---

## AI Mentor Feature Implementation

### 1. Frontend Components (`/app/(dashboard)/ai-mentor/[childId]/page.tsx`)

The AI Mentor is a full-page chat interface with these key features:

**State Management:**
```javascript
const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
```

**Key Functions:**
- `sendMessage()` - Handles user input and API calls
- `loadConversation()` - Loads previous conversation history
- `startNewConversation()` - Creates new chat session

**User Experience Flow:**
1. User selects a child → page loads with child context
2. System shows conversation history in sidebar
3. User can start new conversation or continue existing one
4. Real-time chat with typing indicators and quick suggestions

### 2. API Route: AI Chat (`/api/ai/chat/route.ts`)

This is the main brain of the AI Mentor feature:

**System Prompt Construction:**
```javascript
function buildExpertSystemPrompt(ragContext: any): string {
  // Creates personalized system prompt using:
  // - Child profile (name, age, interests, challenges)
  // - Active concerns
  // - Session summaries
  // - Knowledge base chunks
  // - Latest roadmap
  
  return `You are Dr. Priya Sharma, a world-class child psychologist...
  
  Child Profile:
  Name: ${child.name}
  Age: ${child.age}
  ...
  
  Active Concerns:
  ${concernsText}
  
  Relevant Knowledge Base Chunks:
  ${knowledgeText}`;
}
```

**API Flow:**
1. **Authentication**: Validates Supabase session token
2. **Conversation Management**: Gets or creates conversation record
3. **RAG Context**: Calls `getRagContext()` to gather relevant information
4. **AI Generation**: Sends enriched prompt to AbacusAI
5. **Storage**: Saves both user message and AI response
6. **Memory**: Extracts important insights for future reference

**Model Configuration:**
```javascript
{
  model: "gpt-4.1-mini",
  messages: [systemMsg, ...context, ...history, currentMsg],
  temperature: 0.7,
  max_tokens: 1000
}
```

### 3. Chat Panel Component (`/components/ai-chat/ai-chat-panel.tsx`)

A floating chat widget that can be embedded in other pages:

**Features:**
- Minimizable/maximizable interface
- Real-time conversation
- RAG context debugging (for admins)
- Quick suggestion prompts

---

## Roadmap Generation Feature Implementation

### API Route: Generate Roadmap (`/api/ai/generate-roadmap/route.ts`)

This creates structured counseling session plans:

**Input Processing:**
```javascript
const { childProfile, activeConcerns, recentSessions } = body;
```

**Context Building:**
```javascript
const context = `
Child Profile:
- Name: ${childProfile.name}
- Age: ${childProfile.age}
- Interests: ${childProfile.interests?.join(", ")}
- Challenges: ${childProfile.challenges?.join(", ")}

Active Concerns:
${activeConcerns?.map(concern => 
  `- ${concern.category} (${concern.severity}): ${concern.title}`
).join("\n")}

Recent Session History:
${recentSessions?.map(session => 
  `Session: ${session.summary} (Effectiveness: ${session.effectiveness})`
).join("\n")}
`;
```

**Structured Output:**
The AI is prompted to return JSON with this structure:
```javascript
{
  "sessionFocus": "What should be the primary focus of the upcoming session?",
  "primaryGoals": [
    "Goal 1: Specific, achievable goal",
    "Goal 2: Another specific goal",
    "Goal 3: Third goal"
  ],
  "approaches": [
    "Approach 1: Counseling technique to use",
    "Approach 2: Another technique",
    "Approach 3: Third technique"
  ]
}
```

**Error Handling:**
If JSON parsing fails, the system provides a fallback roadmap:
```javascript
const fallbackRoadmap = {
  sessionFocus: `Focus on building trust and understanding ${childProfile.name}'s current situation`,
  primaryGoals: [
    "Establish a comfortable and safe environment",
    "Listen to current concerns and challenges",
    // ...
  ],
  approaches: [
    "Use active listening and empathetic communication",
    // ...
  ]
};
```

---

## RAG System Architecture

### Core RAG Implementation (`/api/ai/rag-context/route.ts`)

This is the heart of your knowledge retrieval system:

### 1. Static Context (Cached)
**Child Profile Enhancement:**
```javascript
// Calculate age from dateOfBirth
let age = null;
if (childProfile.dateOfBirth) {
  const birthDate = new Date(childProfile.dateOfBirth);
  const today = new Date();
  age = today.getFullYear() - birthDate.getFullYear();
  // Handle month/day adjustments
}

const enhancedChildProfile = {
  ...childProfile,
  name: childProfile.fullName,
  age: age,
  district: childProfile.currentCity,
  schoolLevel: childProfile.currentClassSemester
};
```

**Caching Strategy:**
```javascript
const staticContextCache = new Map(); // In-memory cache
const STATIC_CONTEXT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Cache includes:
// - Child profile
// - Active concerns  
// - Session summaries
```

### 2. Dynamic RAG (Vector Search)
**Embedding Generation:**
```javascript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhance query with context if too generic
let queryText = query || child_id;
if (!query || query.toLowerCase().includes('summary')) {
  const concernTitles = activeConcerns.map(c => c.title).join(' ');
  queryText = `${query} ${concernTitles}`;
}

const embeddingResponse = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: queryText
});
```

**Vector Search:**
```javascript
const rpcRes = await supabaseClient.rpc(
  "match_document_chunks",
  {
    query_embedding: queryEmbedding,
    match_count: 8
  }
);
```

**Fallback Strategy:**
```javascript
// If no chunks found, get general knowledge base chunks
if (ragChunks.length === 0) {
  const { data: fallbackChunks } = await supabase
    .from('document_chunks')
    .select('id, knowledgeBaseId, content, chunkIndex')
    .limit(3)
    .order('chunkIndex', { ascending: true });
}

// Always ensure minimum 2 chunks
if (ragChunks.length < 2) {
  // Add additional chunks with lower similarity scores
}
```

### 3. Final Context Assembly
```javascript
const finalContext = {
  knowledgeChunks: ragChunks,           // Vector search results
  childProfile: enhancedChildProfile,   // Child's information
  activeConcerns: activeConcerns,       // Current issues
  sessionSummaries: sessionSummaries,   // Past session notes
  latestSessionRoadmap: roadmap         // Current session plan
};
```

---

## Data Flow Analysis

### AI Mentor Chat Flow

```
1. User opens AI Mentor page
   ↓
2. Frontend loads child profile and conversation history
   ↓
3. User types message
   ↓
4. Frontend calls /api/ai/chat with:
   - message content
   - child_id
   - sessionId
   - conversationId
   ↓
5. API authenticates user via Supabase
   ↓
6. API calls getRagContext() which:
   - Gets cached child profile/concerns/sessions
   - Generates embedding for user's message
   - Performs vector search for relevant knowledge
   - Assembles complete context object
   ↓
7. API builds system prompt using:
   - Base persona: "You are Dr. Priya Sharma..."
   - Child profile details
   - Active concerns
   - Session history
   - Knowledge chunks
   - Latest roadmap
   ↓
8. API calls AbacusAI with:
   - System prompt
   - Conversation history (last 8 messages)
   - Current user message
   ↓
9. AI generates response
   ↓
10. API saves user message and AI response to database
    ↓
11. API extracts important insights for memory storage
    ↓
12. API returns response to frontend
    ↓
13. Frontend displays AI response and updates conversation
```

### Roadmap Generation Flow

```
1. User requests roadmap (from session page or dedicated interface)
   ↓
2. Frontend calls /api/ai/generate-roadmap with:
   - childProfile object
   - activeConcerns array
   - recentSessions array
   ↓
3. API fetches additional RAG context by calling /api/ai/rag-context
   ↓
4. API builds comprehensive prompt including:
   - Child profile details
   - Active concerns with severity
   - Recent session effectiveness
   - Relevant knowledge chunks
   ↓
5. API calls AbacusAI with structured JSON format requirement
   ↓
6. AI returns structured roadmap JSON
   ↓
7. API parses and validates JSON structure
   ↓
8. If parsing fails, API returns fallback roadmap
   ↓
9. Frontend receives roadmap and displays structured plan
```

---

## Technical Implementation Details

### Database Schema (Key Tables)

**Children Table:**
- Stores child profiles with demographic and background info
- Fields: fullName, dateOfBirth, currentCity, interests, challenges

**Concerns Table:**
- Tracks active issues for each child
- Fields: child_id, category, severity, title, description, status

**AI Chat Conversations:**
- Manages chat sessions
- Fields: id, sessionId, child_id, volunteerId, conversationName

**AI Chat Messages:**
- Stores individual messages
- Fields: conversationId, role, content, ragContext, metadata

**Document Chunks:**
- Knowledge base content for RAG
- Fields: content, embedding (vector), knowledgeBaseId

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ABACUSAI_API_KEY=your_abacus_ai_key
OPENAI_API_KEY=your_openai_key
```

### Key Features

**Memory System:**
The app automatically extracts and stores important conversation moments:
```javascript
const importantKeywords = [
  'breakthrough', 'progress', 'technique worked', 'effective approach',
  'warning sign', 'pattern', 'family context', 'cultural reference'
];

// Categorizes memories as:
// - BREAKTHROUGH_MOMENT
// - EFFECTIVE_TECHNIQUE  
// - CHILD_PREFERENCE
// - WARNING_SIGN
// - CULTURAL_REFERENCE
```

**Error Handling:**
- Graceful fallbacks for AI API failures
- Default responses when RAG context unavailable
- Cached context to reduce API calls

**Performance Optimizations:**
- 5-minute cache for static context
- Vector search limited to top 8 results
- Conversation history limited to last 8 messages
- Background processing for memory extraction

### Security Considerations
- All API routes require Supabase authentication
- Service role key used for database operations
- User context validated on every request
- RAG context filtered by user permissions

This implementation represents a sophisticated AI counseling system that combines real-time chat with comprehensive knowledge retrieval and personalized guidance generation. 
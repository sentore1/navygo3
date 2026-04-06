# Goals API - Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   User Endpoint  │              │  Admin Endpoint  │        │
│  │                  │              │                  │        │
│  │  /api/goals/     │              │  /api/admin/     │        │
│  │  create-with-ai  │              │  goals/create-   │        │
│  │                  │              │  with-ai         │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                   │
│           │  ┌──────────────────────────┐  │                   │
│           └──┤   Supabase Functions     ├──┘                   │
│              │                          │                       │
│              │  • generate-ai-goal      │                       │
│              │  • openai-goal (fallback)│                       │
│              │  • create-goal           │                       │
│              └──────────┬───────────────┘                       │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   OpenAI API  │
                  │  (GPT-3.5)    │
                  └───────────────┘
```

## User Endpoint Flow

```
┌──────────┐
│  Client  │
│ (Logged  │
│   In)    │
└────┬─────┘
     │
     │ POST /api/goals/create-with-ai
     │ {
     │   prompt: "I want to learn Python",
     │   difficulty: "medium",
     │   apiKey: "xxx"
     │ }
     │
     ▼
┌─────────────────────────────────────┐
│  User Endpoint                      │
│  (/api/goals/create-with-ai)        │
├─────────────────────────────────────┤
│                                     │
│  1. Validate API Key                │
│     ├─ Invalid? → 401 Error         │
│     └─ Valid? → Continue            │
│                                     │
│  2. Get User from Session           │
│     ├─ No user? → 401 Error         │
│     └─ User found? → Continue       │
│                                     │
│  3. Check Pro Subscription          │
│     ├─ No AI access? → 403 Error    │
│     └─ Has AI access? → Continue    │
│                                     │
│  4. Call AI Generation Function     │
│     ├─ Error? → 500 Error           │
│     └─ Success? → Continue          │
│                                     │
│  5. Create Goal in Database         │
│     ├─ Error? → 500 Error           │
│     └─ Success? → Return Goal       │
│                                     │
└─────────────────────────────────────┘
     │
     │ Response: { success: true, goal: {...} }
     │
     ▼
┌──────────┐
│  Client  │
│ (Goal    │
│ Created) │
└──────────┘
```

## Admin Endpoint Flow

```
┌──────────┐
│  Admin   │
│  Client  │
└────┬─────┘
     │
     │ POST /api/admin/goals/create-with-ai
     │ {
     │   prompt: "I want to run a marathon",
     │   difficulty: "hard",
     │   userId: "user-uuid",
     │   adminApiKey: "xxx"
     │ }
     │
     ▼
┌─────────────────────────────────────┐
│  Admin Endpoint                     │
│  (/api/admin/goals/create-with-ai)  │
├─────────────────────────────────────┤
│                                     │
│  1. Validate Admin API Key          │
│     ├─ Invalid? → 401 Error         │
│     └─ Valid? → Continue            │
│                                     │
│  2. Validate User Exists            │
│     ├─ Not found? → 404 Error       │
│     └─ Found? → Continue            │
│                                     │
│  3. Call AI Generation Function     │
│     ├─ Primary failed? → Try        │
│     │                    Fallback   │
│     ├─ Both failed? → 500 Error     │
│     └─ Success? → Continue          │
│                                     │
│  4. Return Goal Data                │
│     (NOT saved to database)         │
│                                     │
└─────────────────────────────────────┘
     │
     │ Response: { success: true, goal: {...} }
     │
     ▼
┌──────────┐
│  Admin   │
│  Client  │
│ (Goal    │
│  Data)   │
└──────────┘
```

## AI Goal Generation Process

```
┌─────────────────────────────────────────────────────────────┐
│  Input: Prompt + Difficulty                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Edge Function: generate-ai-goal                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Check OpenAI API Key                                    │
│     ├─ Missing? → Use Fallback Generation                   │
│     └─ Present? → Continue                                  │
│                                                             │
│  2. Call OpenAI API                                         │
│     ├─ Error? → Use Fallback Generation                     │
│     └─ Success? → Parse Response                            │
│                                                             │
│  3. Parse AI Response                                       │
│     ├─ Invalid JSON? → Use Fallback                         │
│     └─ Valid? → Validate Structure                          │
│                                                             │
│  4. Validate Goal Structure                                 │
│     ├─ Missing fields? → Use Fallback                       │
│     └─ Valid? → Return Goal                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Output: Structured Goal                                    │
│  {                                                          │
│    title: "Learn Python in 3 months",                       │
│    description: "Learning goal to...",                      │
│    milestones: [                                            │
│      {                                                      │
│        id: "milestone-1",                                   │
│        title: "Research learning resources",                │
│        description: "Find books, courses...",               │
│        completed: false                                     │
│      },                                                     │
│      ...                                                    │
│    ]                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Admin UI Flow

```
┌──────────────────────────────────────────────────────────────┐
│  Admin Dashboard (/admin/ai-goals)                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  User Interaction                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Admin enters:                                           │
│     • User ID                                               │
│     • Goal prompt                                           │
│     • Difficulty level                                      │
│                                                             │
│  2. Clicks "Generate Goal with AI"                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Call                                                   │
│  POST /api/admin/goals/create-with-ai                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Response Display                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Success:                                                   │
│  ✓ Goal title and description                               │
│  ✓ List of milestones with descriptions                    │
│  ✓ JSON response viewer                                     │
│  ✓ Note about data not being saved                          │
│                                                             │
│  Error:                                                     │
│  ✗ Error message                                            │
│  ✗ Troubleshooting hints                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Difficulty Level Impact

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Difficulty  │  Milestones  │  Complexity  │  Use Case    │
├──────────────┼──────────────┼──────────────┼──────────────┤
│              │              │              │              │
│    EASY      │      3       │    Simple    │  Short-term  │
│              │              │  progression │  goals       │
│              │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│              │              │              │              │
│   MEDIUM     │      5       │   Balanced   │  Most goals  │
│  (Default)   │              │   challenge  │              │
│              │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│              │              │              │              │
│    HARD      │      7       │  Ambitious   │  Long-term   │
│              │              │  progression │  complex     │
│              │              │              │  goals       │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│  API Request                                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    ┌─────────┐
                    │ Validate│
                    │  Input  │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
      ┌─────────┐  ┌─────────┐  ┌─────────┐
      │ Missing │  │ Invalid │  │  Valid  │
      │  Field  │  │  Value  │  │  Input  │
      └────┬────┘  └────┬────┘  └────┬────┘
           │            │            │
           │            │            ▼
           │            │       ┌─────────┐
           │            │       │  Check  │
           │            │       │  Auth   │
           │            │       └────┬────┘
           │            │            │
           │            │    ┌───────┼───────┐
           │            │    │       │       │
           │            │    ▼       ▼       ▼
           │            │  ┌────┐ ┌────┐ ┌────┐
           │            │  │401 │ │403 │ │OK  │
           │            │  └────┘ └────┘ └─┬──┘
           │            │                   │
           │            │                   ▼
           │            │              ┌─────────┐
           │            │              │   AI    │
           │            │              │Generate │
           │            │              └────┬────┘
           │            │                   │
           │            │           ┌───────┼───────┐
           │            │           │       │       │
           │            │           ▼       ▼       ▼
           │            │         ┌────┐ ┌────┐ ┌────┐
           │            │         │500 │ │200 │ │201 │
           │            │         └────┘ └────┘ └────┘
           │            │
           ▼            ▼
      ┌─────────────────────┐
      │   Error Response    │
      │   { error: "..." }  │
      └─────────────────────┘
```

## Integration Patterns

### Pattern 1: Direct Integration
```
Your App → API Endpoint → Response
```

### Pattern 2: Admin Dashboard
```
Admin UI → API Endpoint → Display Result
```

### Pattern 3: Bulk Processing
```
Script → Loop → API Endpoint (multiple calls) → Results
```

### Pattern 4: External System
```
External System → Webhook → Your API → Response → External System
```

## Data Flow

```
┌──────────────┐
│ User Input   │  "I want to learn Python"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ API Endpoint │  Validates & authenticates
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ AI Function  │  Generates structured goal
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ OpenAI API   │  Returns AI-generated content
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Parse & Val. │  Validates structure
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Response     │  Returns to client
└──────────────┘
```

---

These diagrams illustrate the complete flow of the Goals API system, from user input to final response.

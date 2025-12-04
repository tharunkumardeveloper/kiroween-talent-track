# FitFranken AI Chatbot - Deployment Guide

## Overview

FitFranken is an AI-powered chatbot assistant integrated into Talent Track. It uses Groq's LLM API with RAG (Retrieval-Augmented Generation) to provide contextual fitness guidance.

## Features Implemented

✅ **Chat Widget** - Floating button accessible from all athlete tabs
✅ **Context Awareness** - Knows current tab, user stats, and workout history
✅ **RAG Engine** - Retrieves relevant knowledge from comprehensive knowledge base
✅ **Groq API Integration** - Fast LLM responses with llama-3.3-70b-versatile
✅ **Conversation History** - Persistent chat history in localStorage
✅ **Navigation Actions** - Can navigate users to workouts and features
✅ **FitFranken Personality** - Motivating, coach-like personality with resurrection theme
✅ **Error Handling** - Retry logic, rate limiting, graceful error messages
✅ **Responsive Design** - Works on mobile and desktop

## Local Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` file in project root:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Test the chatbot**:
   - Navigate to any athlete tab (Training, Discover, Report, Roadmap)
   - Click the purple floating chat button in bottom-right corner
   - Start chatting with FitFranken!

## Vercel Deployment

### Step 1: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `your_groq_api_key_here`
   - **Environment**: Production, Preview, Development (select all)

### Step 2: Deploy

```bash
# Deploy to Vercel
vercel --prod
```

Or push to your connected Git repository (GitHub, GitLab, Bitbucket) and Vercel will auto-deploy.

### Step 3: Verify Deployment

1. Visit your deployed site
2. Navigate to Training tab
3. Click the chat button
4. Send a test message like "What workouts are available?"
5. Verify FitFranken responds correctly

## API Endpoints

### POST /api/chat

Handles chat messages and returns AI responses.

**Request Body**:
```json
{
  "message": "How do I do push-ups?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! I'm FitFranken..." }
  ],
  "userContext": {
    "userName": "Athlete",
    "userRole": "athlete",
    "recentWorkouts": [],
    "currentStats": {
      "totalWorkouts": 24,
      "weeklyStreak": 5,
      "badges": 12
    }
  },
  "currentTab": "training"
}
```

**Response**:
```json
{
  "message": "Push-ups are a fundamental upper body exercise...",
  "actions": [
    {
      "type": "start_workout",
      "label": "Start Push-ups",
      "payload": { "workoutName": "push-ups" }
    }
  ]
}
```

## Knowledge Base

The chatbot has comprehensive knowledge about:

- **7 Presidential Fitness Test Workouts**: Push-ups, Pull-ups, Sit-ups, Vertical Jump, Shuttle Run, Sit & Reach, Broad Jump
- **Platform Features**: Ghost Mode, Test Mode, Challenges, Badges, Report Tab, Roadmap
- **Navigation**: How to start workouts, switch tabs, access features
- **Fitness Advice**: Form tips, workout frequency, nutrition basics, warm-up/cool-down

Knowledge base location: `api/knowledge-base.json`

## Architecture

```
Frontend (React)
  ├── ChatWidget (floating button)
  ├── ChatInterface (expanded chat UI)
  ├── MessageList (message display)
  └── ChatInput (user input)
       ↓
Backend API (/api/chat)
  ├── RAG Engine (context retrieval)
  ├── Groq API (LLM)
  └── Rate Limiting
```

## Troubleshooting

### Chat button not appearing

- Check that you're on an athlete tab (not coach/admin view)
- Verify ChatWidget is imported in HomeScreen.tsx
- Check browser console for errors

### API errors

- Verify GROQ_API_KEY is set in environment variables
- Check Vercel function logs for errors
- Ensure groq-sdk is in dependencies (not devDependencies)

### Slow responses

- Normal response time: 1-3 seconds
- If slower, check Groq API status
- Verify rate limiting isn't being triggered

### Chat history not persisting

- Check browser localStorage is enabled
- Verify localStorage key: `fitfranken_chat_history`
- Clear history and try again

## Rate Limits

- **Per User**: 10 messages per minute
- **Per IP**: 20 messages per minute
- **Groq API**: Handled with exponential backoff retry

## Future Enhancements

- [ ] Voice input for hands-free interaction
- [ ] Proactive workout suggestions
- [ ] Multi-language support
- [ ] Semantic search with embeddings
- [ ] Real-time workout coaching
- [ ] Social features (share conversations)

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Verify environment variables are set
3. Check Vercel function logs
4. Review knowledge base for missing information

## Credits

- **Groq API**: Fast LLM inference
- **llama-3.3-70b-versatile**: Language model
- **React**: UI framework
- **Vercel**: Hosting and serverless functions

---

**Built with ❤️ for Talent Track - Resurrecting the Presidential Fitness Test with AI** 👻💪

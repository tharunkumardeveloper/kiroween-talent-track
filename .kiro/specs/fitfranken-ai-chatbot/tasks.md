# Implementation Plan

- [x] 1. Set up project infrastructure and dependencies


  - Install Groq SDK and required dependencies
  - Configure environment variables for development and production
  - Create API directory structure for Vercel serverless functions
  - _Requirements: 9.1, 9.2, 9.5_





- [ ] 2. Create knowledge base and RAG engine
  - [ ] 2.1 Create knowledge base JSON file with workout information
    - Document all 7 Presidential Fitness Test workouts (Push-ups, Pull-ups, Sit-ups, Vertical Jump, Shuttle Run, Sit Reach, Vertical Broad Jump)

    - Include form tips, common mistakes, and scoring information for each workout
    - Add keywords for effective retrieval
    - _Requirements: 3.1, 4.4_

  - [ ] 2.2 Create knowledge base entries for platform features
    - Document Ghost Mode functionality and access instructions
    - Document Test Mode functionality and access instructions

    - Document Challenges system and how to participate
    - Document Badges and Roadmap features
    - Document Report tab and progress tracking
    - _Requirements: 3.2, 4.4_

  - [x] 2.3 Create knowledge base entries for navigation


    - Document how to start workouts (upload vs live recording)
    - Document how to navigate between tabs
    - Document how to access profile and settings
    - Document how to view workout history




    - _Requirements: 3.3, 7.1, 7.2, 7.3_

  - [ ] 2.4 Implement RAG retrieval engine
    - Create keyword-based scoring algorithm

    - Implement context ranking by relevance
    - Add tab-specific context boosting
    - Return top 3 most relevant knowledge entries
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Implement backend API endpoint

  - [ ] 3.1 Create /api/chat serverless function
    - Set up Vercel serverless function structure
    - Initialize Groq SDK with API key from environment
    - Implement request validation and error handling
    - _Requirements: 9.1, 9.2, 9.3_


  - [ ] 3.2 Implement RAG-augmented prompt generation
    - Integrate RAG engine to retrieve relevant context
    - Build system prompt with FitFranken personality
    - Include user context (name, tab, stats) in prompt
    - Include retrieved knowledge in prompt
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.3_


  - [ ] 3.3 Implement Groq API integration
    - Call Groq chat completions API with llama-3.3-70b-versatile model
    - Include conversation history (last 10 messages)


    - Set appropriate temperature (0.7) and max tokens (500)
    - Handle streaming responses for future enhancement
    - _Requirements: 9.2, 9.5_

  - [ ] 3.4 Implement error handling and retry logic
    - Handle rate limiting with exponential backoff
    - Handle network timeouts (10 second limit)
    - Handle invalid responses with fallback messages
    - Log errors for debugging
    - _Requirements: 9.3, 9.4_

  - [ ] 3.5 Implement rate limiting
    - Add per-user rate limiting (10 messages/minute)
    - Add per-IP rate limiting (20 messages/minute)
    - Return appropriate error messages when limits exceeded
    - _Requirements: 9.4_

- [x] 4. Create frontend chat components

  - [x] 4.1 Create ChatWidget container component

    - Implement floating button in minimized state
    - Position button bottom-right (adjust for mobile navigation)
    - Add open/close state management
    - Add z-index layering (1000)
    - Integrate with existing HomeScreen component
    - _Requirements: 1.1, 1.2, 1.5, 10.5_

  - [x] 4.2 Create ChatInterface expanded view


    - Implement slide-in panel animation
    - Create responsive layout (mobile: 70% height, desktop: 420x650px)
    - Add header with FitFranken branding and close button
    - Add context badge showing current tab
    - Ensure underlying content remains visible
    - _Requirements: 1.2, 1.3, 10.1, 10.2, 10.3, 10.4_

  - [x] 4.3 Create MessageList component


    - Render user and bot messages with distinct styling
    - Implement auto-scroll to latest message
    - Add relative timestamps ("2m ago")
    - Implement message virtualization for performance
    - Add empty state for first-time users
    - _Requirements: 5.1, 5.2, 11.5_

  - [x] 4.4 Create ChatInput component


    - Create textarea with auto-resize
    - Add send button with loading state
    - Implement enter-to-send (shift+enter for new line)
    - Add character limit (500 characters)
    - Disable input while waiting for response
    - _Requirements: 11.1_

  - [x] 4.5 Create TypingIndicator component

    - Show animated dots while bot is "thinking"
    - Display within 200ms of sending message
    - Hide when response arrives
    - _Requirements: 11.2_

  - [x] 4.6 Implement FitFranken personality in UI

    - Add ghost emoji (👻) to branding
    - Use encouraging color scheme (purple theme)
    - Add motivational welcome message
    - Include resurrection theme references
    - _Requirements: 2.1, 2.2_

- [x] 5. Implement context awareness system


  - [x] 5.1 Create UserContext provider

    - Track current tab from HomeScreen props
    - Access user profile data (name, role)
    - Access workout history from local storage
    - Access current stats (streak, badges, workouts)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.2 Implement tab change detection

    - Update context when user switches tabs
    - Update context badge in chat header
    - Include tab context in API requests
    - _Requirements: 1.4, 6.1, 6.5_

  - [x] 5.3 Implement workout history integration

    - Read recent workouts from local storage
    - Format workout data for context
    - Include in API requests when relevant
    - _Requirements: 6.3_

- [x] 6. Implement conversation history and persistence

  - [x] 6.1 Create conversation state management

    - Maintain messages array in component state
    - Include message metadata (id, timestamp, role)
    - Limit to last 50 messages in memory
    - _Requirements: 5.1, 5.4_

  - [x] 6.2 Implement local storage persistence

    - Save conversation history to localStorage on each message
    - Load conversation history on component mount
    - Use versioned schema for future compatibility
    - Handle storage quota exceeded errors
    - _Requirements: 12.1, 12.2, 12.5_

  - [x] 6.3 Implement conversation context in API calls

    - Send last 10 messages with each API request
    - Format messages for Groq API (role + content)
    - Handle context window limits
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 6.4 Implement clear history functionality

    - Add clear button in chat header menu
    - Show confirmation dialog
    - Clear from state and localStorage
    - Reset to welcome message
    - _Requirements: 12.4_

- [x] 7. Implement navigation actions

  - [x] 7.1 Create action extraction from bot responses

    - Parse bot responses for navigation suggestions
    - Identify workout names, feature names, tab names
    - Create action buttons for detected actions
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 7.2 Implement navigation handlers

    - Handle "Start [Workout]" actions → navigate to workout detail
    - Handle "View [Tab]" actions → switch to specified tab
    - Handle "Open Ghost Mode" → navigate to Ghost Mode
    - Handle "Open Test Mode" → navigate to Test Mode
    - Close chat interface after navigation
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.3 Test navigation from all tabs

    - Test navigation from Training tab
    - Test navigation from Discover tab
    - Test navigation from Report tab
    - Test navigation from Roadmap tab
    - _Requirements: 7.5_

- [x] 8. Implement general fitness conversation capabilities

  - [x] 8.1 Add fitness knowledge to knowledge base

    - Add form tips for all exercises
    - Add workout modification suggestions
    - Add general fitness advice (recovery, nutrition basics)
    - Add Presidential Fitness Test standards and history
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 8.2 Implement topic boundary handling

    - Detect off-topic questions
    - Politely redirect to fitness topics
    - Suggest relevant fitness questions
    - _Requirements: 8.4_

  - [x] 8.3 Implement motivational responses

    - Detect goal-setting discussions
    - Provide encouraging feedback
    - Celebrate achievements mentioned by user
    - _Requirements: 2.3, 8.3_

- [x] 9. Implement responsive design and mobile optimization

  - [x] 9.1 Implement mobile layout

    - Full-width chat interface on mobile
    - Adjust for bottom navigation (80px from bottom)
    - Slide-up animation from bottom
    - Handle keyboard appearance
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 9.2 Implement desktop layout

    - Fixed width (420px) and height (650px)
    - Bottom-right corner positioning
    - Smooth expand/collapse animation
    - _Requirements: 10.4_

  - [ ]* 9.3 Test on various devices
    - Test on mobile (iOS Safari, Android Chrome)
    - Test on tablet (iPad, Android tablet)
    - Test on desktop (Chrome, Firefox, Safari, Edge)
    - _Requirements: 10.1, 10.4_

- [ ] 10. Implement performance optimizations
  - [x] 10.1 Implement lazy loading

    - Lazy load chat components on first open
    - Defer knowledge base loading
    - Use React.lazy and Suspense
    - _Requirements: 11.1_

  - [ ] 10.2 Implement message virtualization

    - Use react-window for long message lists
    - Render only visible messages
    - Maintain scroll position
    - _Requirements: 11.5_


  - [ ]* 10.3 Implement debouncing
    - Debounce typing indicator (300ms)
    - Debounce context updates (500ms)
    - _Requirements: 11.2_

  - [x] 10.4 Implement response time optimization

    - Target < 500ms for UI rendering
    - Target < 3s for API responses
    - Show loading states appropriately
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 11. Configure deployment and environment variables


  - [x] 11.1 Set up Vercel environment variables

    - Add GROQ_API_KEY to Vercel project settings
    - Configure for production environment
    - Test environment variable access in serverless function
    - _Requirements: 9.1, 9.5_

  - [x] 11.2 Update vercel.json configuration

    - Configure serverless function memory (1024MB)
    - Set max duration (10 seconds)
    - Ensure proper routing for /api/chat
    - _Requirements: 9.5_

  - [x] 11.3 Add groq-sdk to production dependencies

    - Move groq-sdk from devDependencies to dependencies
    - Verify package.json configuration
    - Test build process
    - _Requirements: 9.5_

  - [x] 11.4 Test deployment

    - Deploy to Vercel preview environment
    - Test chat functionality in preview
    - Verify API key security (not exposed in client)
    - Test error handling in production environment
    - _Requirements: 9.5_

- [x] 12. Integration and end-to-end testing


  - [x] 12.1 Test complete chat flow

    - User opens chat widget
    - User sends message
    - Bot responds with relevant answer
    - Conversation history maintained
    - _Requirements: 1.1, 1.2, 5.1, 11.3_

  - [x] 12.2 Test context awareness

    - Switch between tabs, verify context updates
    - Ask tab-specific questions, verify relevant responses
    - Verify workout history integration
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

  - [x] 12.3 Test navigation actions

    - Request navigation to workout, verify navigation occurs
    - Request navigation to feature, verify navigation occurs
    - Verify chat closes after navigation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 12.4 Test error scenarios

    - Test with invalid API key (should show error message)
    - Test with network offline (should show timeout message)
    - Test with rate limiting (should show retry message)
    - _Requirements: 9.3, 9.4_

  - [ ]* 12.5 Test persistence
    - Send messages, close app, reopen, verify history restored
    - Clear history, verify messages removed
    - Test with 50+ messages, verify archiving works
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 12.6 Test on all athlete tabs
    - Test chat widget on Training tab
    - Test chat widget on Discover tab
    - Test chat widget on Report tab
    - Test chat widget on Roadmap tab
    - _Requirements: 1.1, 1.4_

  - [ ]* 12.7 Test FitFranken personality
    - Verify encouraging tone in responses
    - Verify resurrection theme references
    - Verify emoji usage is appropriate
    - Verify consistency across different questions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 12.8 Test knowledge accuracy
    - Ask about each of the 7 workouts, verify accurate responses
    - Ask about Ghost Mode, Test Mode, Challenges, verify accurate responses
    - Ask about navigation, verify accurate instructions
    - Ask general fitness questions, verify helpful responses
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2_

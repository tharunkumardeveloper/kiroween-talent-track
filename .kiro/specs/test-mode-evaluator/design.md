# Design Document

## Overview

Test Mode is a specialized workout evaluation interface designed for Talent Track evaluators. It provides a streamlined, red-themed alternative to Ghost Mode that automatically loads pre-recorded test videos for each workout type. The system eliminates the need for evaluators to perform exercises or upload videos, enabling consistent and efficient performance evaluation.

The design reuses existing Ghost Mode components and MediaPipe processing infrastructure while introducing new UI components with red theming and simplified workflow. Test videos are bundled with the application in the public directory and deployed to Vercel as static assets.

## Architecture

### Component Hierarchy

```
Index.tsx (Main App)
├── HomeScreen.tsx (with Test Mode banner)
├── TestModeTab.tsx (NEW - Test Mode workout selection)
└── TestWorkoutDetail.tsx (NEW - Test Mode workout detail)
    └── TestWorkoutInterface.tsx (NEW - Test Mode workout execution)
        ├── TestVideoProcessor.tsx (NEW - Video processing with MediaPipe)
        └── TestSkeletonRenderer.tsx (NEW - Pose visualization)
```

### Data Flow

1. User clicks Test Mode banner on HomeScreen
2. Navigation switches to TestModeTab showing available workouts
3. User selects a workout → TestWorkoutDetail displays
4. User clicks "Start Workout" → TestWorkoutInterface loads
5. System automatically fetches corresponding test video from `/test-videos/`
6. System converts video to File object and passes to VideoProcessor
7. VideoProcessor displays processing screen with:
   - Live preview of skeleton overlay
   - Progress bar showing processing status
   - Real-time metrics (reps, form quality, angles)
8. When processing completes, VideoProcessor displays results screen with:
   - Annotated video player with skeleton overlay
   - Metrics grid (posture, reps, duration, etc.)
   - Performance summary
   - Submit button
9. User reviews results and clicks "Complete Evaluation"
10. Results are saved with `isTestMode: true` flag

## Components and Interfaces

### 1. TestModeTab Component

**Purpose**: Display available workouts in Test Mode with red theming

**Props**:
```typescript
interface TestModeTabProps {
  onWorkoutSelect: (workout: Workout) => void;
  onBack: () => void;
}
```

**Features**:
- Red gradient background (from-red-950 via-gray-900 to-red-950)
- Grid layout of workout cards
- Each card shows workout name, image, and "Start Test" button
- Reuses workout data structure from Ghost Mode

### 2. TestWorkoutDetail Component

**Purpose**: Display workout details and "Start Workout" button

**Props**:
```typescript
interface TestWorkoutDetailProps {
  activity: Workout;
  onBack: () => void;
  onStartWorkout: () => void;
}
```

**Features**:
- Red-themed UI matching Test Mode aesthetic
- Displays workout description, muscles, steps, and common mistakes
- Single "Start Workout" button (no Live/Upload mode selection)
- Reuses activity content database from GhostWorkoutDetail

### 3. TestWorkoutInterface Component

**Purpose**: Main workout execution interface - reuses VideoProcessor with red theme

**Props**:
```typescript
interface TestWorkoutInterfaceProps {
  activity: Workout;
  onComplete: (results: WorkoutResults) => void;
  onBack: () => void;
}
```

**Features**:
- Automatically loads test video based on workout type
- Immediately starts processing (no upload screen)
- Wraps VideoProcessor component with red-themed styling
- Passes test video file to VideoProcessor for processing

**Video Mapping**:
```typescript
const testVideoMap: Record<string, string> = {
  'Push-ups': '/test-videos/pushup.mp4',
  'Pull-ups': '/test-videos/pullup.mp4',
  'Sit-ups': '/test-videos/situp.mp4',
  'Shuttle Run': '/test-videos/shuttlerun.mp4',
  'Sit Reach': '/test-videos/sit&reach.mp4',
  'Vertical Jump': '/test-videos/vertical.mp4'
};
```

**Implementation Approach**:
- Fetch test video from public directory
- Convert to File object
- Pass to VideoProcessor component
- Apply red theme overrides via CSS classes or theme context

### 4. TestVideoProcessor Component (Red-themed VideoProcessor)

**Purpose**: Wrapper around VideoProcessor with red theme styling

**Approach**: 
- Reuse existing VideoProcessor component from normal workout mode
- Apply red theme via CSS class overrides or theme provider
- No changes to processing logic - only visual styling
- Maintains same processing screen with live preview
- Maintains same results screen with video player and metrics

**Red Theme Overrides**:
- Replace primary colors with red variants
- Update progress bars to red gradient
- Change success badges to red theme
- Modify card borders and shadows to red tones

## Data Models

### Workout Interface
```typescript
interface Workout {
  name: string;
  image: string;
  description: string;
  muscles: string[];
  category: string;
  steps: string[];
  mistakes: string[];
}
```

### WorkoutResults Interface
```typescript
interface WorkoutResults {
  activityName: string;
  totalReps: number;
  correctReps: number;
  badReps: number;
  duration: string;
  posture: 'Good' | 'Needs Improvement';
  timestamp: number;
  isTestMode: true;
}
```

### PoseLandmark Interface (from MediaPipe)
```typescript
interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
```

## Error Handling

### Video Loading Errors
- Display error message if test video fails to load
- Provide "Retry" button
- Log error details for debugging

### MediaPipe Errors
- Gracefully handle MediaPipe initialization failures
- Display user-friendly error message
- Offer fallback to view video without pose detection

### Missing Video Files
- Validate video file existence before loading
- Display clear error if video file is missing
- Provide list of available test videos

## Testing Strategy

### Component Testing
- Test TestModeTab renders workout list correctly
- Test TestWorkoutDetail displays workout information
- Test TestWorkoutInterface loads correct video for each workout type
- Test red theming is applied consistently

### Integration Testing
- Test navigation flow from HomeScreen → TestModeTab → TestWorkoutDetail → TestWorkoutInterface
- Test video playback and MediaPipe processing integration
- Test results calculation and display

### Video Asset Testing
- Verify all test videos are accessible in public directory
- Test video playback in different browsers
- Verify videos are included in Vercel deployment

## Deployment Considerations

### Static Asset Management
- Test videos stored in `public/test-videos/` directory
- Videos included in Vercel build automatically
- Total video size should be optimized for deployment

### Video Optimization
- Videos should be compressed for web delivery
- Recommended format: MP4 with H.264 codec
- Target resolution: 720p or 1080p
- Target file size: < 10MB per video

### Vercel Configuration
- No special configuration needed for static assets
- Videos served from CDN automatically
- Ensure `public/test-videos/` is not in `.gitignore`

## Theme Specification

### Red Theme Colors
```css
/* Primary Red Shades */
--red-950: rgb(69, 10, 10);
--red-900: rgb(127, 29, 29);
--red-800: rgb(153, 27, 27);
--red-700: rgb(185, 28, 28);
--red-600: rgb(220, 38, 38);
--red-500: rgb(239, 68, 68);
--red-400: rgb(248, 113, 113);
--red-300: rgb(252, 165, 165);
--red-200: rgb(254, 202, 202);
--red-100: rgb(254, 226, 226);

/* Gradient Backgrounds */
bg-gradient-to-r from-red-950 via-gray-900 to-red-950
bg-gradient-to-b from-red-950 via-gray-900 to-black

/* Border Colors */
border-red-500/50
border-red-400/80

/* Shadow Colors */
shadow-red-500/30
shadow-red-500/50
```

### UI Element Theming
- **Headers**: Red gradient backgrounds with red borders
- **Buttons**: Red primary buttons, red outline buttons
- **Badges**: Red background with red borders
- **Icons**: Red-400 to Red-300 colors
- **Text**: Red-100 for primary text, Red-200/300 for secondary
- **Overlays**: Red-tinted overlays and animations

## Reusable Services

### MediaPipeProcessor Service
- Location: `src/services/mediapipeProcessor.ts`
- Used by both Ghost Mode and Test Mode
- No modifications needed
- Handles pose detection and landmark extraction

### WorkoutStorage Utility
- Location: `src/utils/workoutStorage.ts`
- Used to store Test Mode results
- Add `isTestMode: true` flag to distinguish from Ghost Mode results

## File Structure

```
src/
├── components/
│   ├── test/
│   │   ├── TestModeTab.tsx (NEW)
│   │   ├── TestWorkoutDetail.tsx (NEW)
│   │   └── TestWorkoutInterface.tsx (NEW - wraps VideoProcessor with red theme)
│   ├── workout/
│   │   └── VideoProcessor.tsx (REUSE - no changes, used by Test Mode)
│   ├── home/
│   │   └── HomeScreen.tsx (MODIFY - add Test Mode banner)
│   └── ...
├── services/
│   └── mediapipeProcessor.ts (REUSE - no changes)
├── utils/
│   └── workoutStorage.ts (REUSE - no changes)
├── styles/
│   └── test-mode-theme.css (NEW - red theme overrides)
└── pages/
    └── Index.tsx (MODIFY - add Test Mode routing)

public/
└── test-videos/ (NEW - move from root)
    ├── pullup.mp4
    ├── pushup.mp4
    ├── shuttlerun.mp4
    ├── sit&reach.mp4
    ├── situp.mp4
    └── vertical.mp4
``` 
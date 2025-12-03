# Design Document

## Overview

The Spooky Skeleton Ghost Mode feature transforms the current static GIF-based ghost overlay into a dynamic, canvas-rendered skeleton animation system. This enhancement provides users with a more engaging and performant visual reference during Ghost Mode workouts. The system will display the user's workout video alongside a programmatically generated skeleton performing the same exercise with ideal form, complete with real-time metrics and celebratory feedback.

The design maintains complete separation from the normal workout flow, ensuring that only Ghost Mode workouts are affected by these changes.

## Architecture

### High-Level Component Structure

```
GhostWorkoutInterface (existing)
├── GhostWorkoutUploadScreen (existing - no changes)
├── GhostLiveRecorder (existing - no changes)
└── GhostVideoProcessor (modified)
    ├── DualVideoDisplay (new)
    │   ├── UserVideoPanel (new)
    │   │   └── MetricsOverlay (new)
    │   └── GhostSkeletonPanel (new)
    │       ├── SkeletonRenderer (new)
    │       └── MetricsOverlay (new)
    └── GhostBeatScreen (new)
```

### Data Flow

1. **User completes workout** → GhostWorkoutInterface receives results
2. **Results passed to GhostVideoProcessor** → Determines if user beat ghost
3. **GhostVideoProcessor renders DualVideoDisplay** → Shows side-by-side comparison
4. **SkeletonRenderer loads keyframes** → Animates skeleton based on exercise type
5. **MetricsOverlay updates** → Real-time metrics displayed on both panels
6. **Workout completion** → GhostBeatScreen shows results and badge (if earned)

## Components and Interfaces

### 1. SkeletonRenderer Component

**Purpose**: Canvas-based component that renders animated skeleton using MediaPipe-style landmark connections.

**Props Interface**:
```typescript
interface SkeletonRendererProps {
  exerciseType: string;           // 'Push-ups', 'Pull-ups', etc.
  isPlaying: boolean;              // Control animation playback
  speed: number;                   // Animation speed multiplier (default: 1.0)
  onRepComplete?: () => void;      // Callback when skeleton completes one rep
  className?: string;
}
```

**Key Methods**:
- `loadKeyframes(exerciseType: string)`: Loads exercise-specific pose data
- `interpolatePose(frame1, frame2, alpha)`: Smooth transitions between keyframes
- `drawSkeleton(landmarks)`: Renders skeleton with connections
- `drawSkullHead(landmark)`: Custom skull rendering at head position
- `animate()`: Main animation loop using requestAnimationFrame

**Rendering Details**:
- Canvas size: Responsive to container (maintains aspect ratio)
- Background: Pure black (#000000)
- Skeleton colors: Purple (#A855F7) for bones, Cyan (#00FFFF) for joints
- Glow effect: `shadowBlur: 20px`, `shadowColor: #A855F7`
- Skull: Custom path drawing with eye sockets, nose triangle, and teeth

### 2. SkeletonKeyframeData

**Purpose**: Stores pre-defined pose sequences for each exercise type.

**Data Structure**:
```typescript
interface Landmark3D {
  x: number;  // Normalized 0-1
  y: number;  // Normalized 0-1
  z: number;  // Depth (relative)
  visibility: number;  // 0-1
}

interface KeyframeData {
  landmarks: Landmark3D[];  // 33 MediaPipe pose landmarks
  duration: number;         // Milliseconds to hold this pose
  repPhase: 'start' | 'down' | 'up' | 'peak';  // Rep tracking
}

interface ExerciseKeyframes {
  exerciseType: string;
  keyframes: KeyframeData[];
  targetReps: number;
  targetTime: number;  // seconds
  targetFormScore: number;  // percentage
}
```

**Keyframe Definitions** (stored in `/src/data/ghostKeyframes.ts`):
- **Push-ups**: 4 keyframes (plank → down → up → plank)
- **Pull-ups**: 3 keyframes (hang → pull → hang)
- **Sit-ups**: 3 keyframes (lying → crunch → lying)
- **Vertical Jump**: 4 keyframes (stand → crouch → jump → land)
- **Shuttle Run**: 6 keyframes (start → sprint → turn → sprint → turn → finish)
- **Sit Reach**: 3 keyframes (sit → reach → hold)

### 3. DualVideoDisplay Component

**Purpose**: Container that manages side-by-side or stacked video layout.

**Props Interface**:
```typescript
interface DualVideoDisplayProps {
  userVideo: File | Blob | string;  // User's workout video
  exerciseType: string;
  userMetrics: WorkoutMetrics;
  ghostMetrics: WorkoutMetrics;
  onPlaybackComplete?: () => void;
}

interface WorkoutMetrics {
  reps: number;
  time: number;  // seconds
  formScore: number;  // percentage
  currentPhase: string;
}
```

**Layout Strategy**:
- **Mobile/Tablet**: Stacked vertically (user top, ghost bottom)
- **Desktop**: Side-by-side (user left, ghost right)
- **Aspect Ratio**: 16:9 for both panels
- **Synchronization**: Both videos/animations progress at same rate

### 4. MetricsOverlay Component

**Purpose**: Displays real-time workout metrics on video feeds.

**Props Interface**:
```typescript
interface MetricsOverlayProps {
  reps: number;
  targetReps: number;
  time: number;
  formScore: number;
  isGhost: boolean;  // Different styling for ghost vs user
  beatTarget?: boolean;  // Highlight when user beats ghost
}
```

**Visual Design**:
- Position: Top-right corner of video panel
- Background: Semi-transparent dark overlay (`bg-black/60`)
- Text colors:
  - Reps: White (user), Purple (ghost)
  - Time: Cyan
  - Form Score: Green (>85%), Orange (70-85%), Red (<70%)
- Beat Target Effect: Pulsing green glow animation

### 5. GhostBeatScreen Component

**Purpose**: Celebratory screen shown when user beats the ghost.

**Props Interface**:
```typescript
interface GhostBeatScreenProps {
  userMetrics: WorkoutMetrics;
  ghostMetrics: WorkoutMetrics;
  exerciseType: string;
  badge: BadgeData | null;
  onContinue: () => void;
  onRetry: () => void;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

**Visual Elements**:
- Confetti animation (using canvas particles)
- Badge display with scale-in animation
- Comparison table (user vs ghost metrics)
- Congratulatory message with random variations
- Action buttons: "Continue" and "Retry Challenge"

## Data Models

### Ghost Performance Targets

```typescript
const GHOST_TARGETS: Record<string, GhostTarget> = {
  'Push-ups': {
    targetReps: 25,
    targetTime: 150,  // 2:30
    targetFormScore: 95,
    difficulty: 'medium'
  },
  'Pull-ups': {
    targetReps: 15,
    targetTime: 120,  // 2:00
    targetFormScore: 90,
    difficulty: 'hard'
  },
  'Sit-ups': {
    targetReps: 30,
    targetTime: 120,  // 2:00
    targetFormScore: 92,
    difficulty: 'medium'
  },
  'Vertical Jump': {
    targetReps: 10,
    targetTime: 60,  // 1:00
    targetFormScore: 88,
    difficulty: 'easy'
  },
  'Shuttle Run': {
    targetReps: 8,  // 8 complete shuttles
    targetTime: 180,  // 3:00
    targetFormScore: 90,
    difficulty: 'hard'
  },
  'Sit Reach': {
    targetReps: 3,  // 3 holds
    targetTime: 90,  // 1:30
    targetFormScore: 85,
    difficulty: 'easy'
  }
};
```

### Beat Ghost Calculation

```typescript
interface BeatGhostResult {
  didBeat: boolean;
  repsDiff: number;  // positive if user beat ghost
  timeDiff: number;  // negative if user was faster
  formDiff: number;  // positive if user had better form
  badge: BadgeData | null;
}

function calculateBeatGhost(
  userMetrics: WorkoutMetrics,
  ghostTarget: GhostTarget
): BeatGhostResult {
  const didBeat = 
    userMetrics.reps >= ghostTarget.targetReps &&
    userMetrics.formScore >= 85;  // Minimum form threshold
  
  return {
    didBeat,
    repsDiff: userMetrics.reps - ghostTarget.targetReps,
    timeDiff: userMetrics.time - ghostTarget.targetTime,
    formDiff: userMetrics.formScore - ghostTarget.targetFormScore,
    badge: didBeat ? GHOST_SLAYER_BADGE : null
  };
}
```

### Ghost Slayer Badge

```typescript
const GHOST_SLAYER_BADGE: BadgeData = {
  id: 'ghost_slayer',
  name: 'Ghost Slayer',
  description: 'Beat the ghost in a workout challenge',
  icon: '👻💀',
  rarity: 'epic',
  color: '#A855F7',  // Purple
  glowColor: '#FFD700'  // Gold
};
```

## Error Handling

### Keyframe Loading Errors

```typescript
try {
  const keyframes = await loadKeyframes(exerciseType);
  setKeyframeData(keyframes);
} catch (error) {
  console.error('Failed to load keyframes:', error);
  // Fallback: Use default animation or show error message
  setKeyframeData(DEFAULT_KEYFRAMES);
  toast.error('Failed to load ghost animation');
}
```

### Canvas Rendering Errors

```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context');
    setRenderError(true);
    return;
  }
  
  // Continue with rendering...
}, []);
```

### Video Synchronization Errors

```typescript
const syncVideos = () => {
  const userVideo = userVideoRef.current;
  const ghostAnimation = ghostAnimationRef.current;
  
  if (!userVideo || !ghostAnimation) {
    console.warn('Video elements not ready for sync');
    return;
  }
  
  // Sync playback rates
  const timeDiff = Math.abs(
    userVideo.currentTime - ghostAnimation.currentTime
  );
  
  if (timeDiff > 0.5) {  // More than 500ms out of sync
    ghostAnimation.currentTime = userVideo.currentTime;
  }
};
```

## Testing Strategy

### Unit Tests

1. **SkeletonRenderer Tests**
   - Test keyframe interpolation accuracy
   - Verify skull rendering at correct position
   - Test animation loop timing
   - Validate canvas drawing operations

2. **Beat Ghost Calculation Tests**
   - Test various user performance scenarios
   - Verify badge awarding logic
   - Test edge cases (exact match, near miss)

3. **Keyframe Data Tests**
   - Validate all exercise keyframes exist
   - Check landmark count (should be 33)
   - Verify normalized coordinates (0-1 range)

### Integration Tests

1. **DualVideoDisplay Tests**
   - Test video synchronization
   - Verify metrics update correctly
   - Test responsive layout switching

2. **GhostWorkoutInterface Flow Tests**
   - Test upload → processing → results flow
   - Test live recording → results flow
   - Verify badge unlocking integration

### Visual Regression Tests

1. **Skeleton Rendering**
   - Capture screenshots of skeleton at key poses
   - Compare against reference images
   - Verify glow effects and colors

2. **GhostBeatScreen**
   - Test confetti animation rendering
   - Verify badge display styling
   - Test responsive layout

### Performance Tests

1. **Animation Performance**
   - Measure FPS during skeleton animation
   - Target: Consistent 60 FPS
   - Test on low-end devices

2. **Memory Usage**
   - Monitor memory during long animations
   - Verify no memory leaks in animation loop
   - Test with multiple exercise types

## Implementation Notes

### Phase 1: Core Skeleton Renderer
- Create SkeletonRenderer component with basic drawing
- Implement keyframe data structure
- Add interpolation logic
- Test with one exercise type (Push-ups)

### Phase 2: Keyframe Data
- Define keyframes for all 6 exercises
- Create keyframe loading utility
- Add validation for keyframe data
- Test animation smoothness

### Phase 3: Dual Video Display
- Create DualVideoDisplay component
- Implement responsive layout
- Add video synchronization logic
- Integrate MetricsOverlay

### Phase 4: Beat Ghost Logic
- Implement beat calculation
- Create GhostBeatScreen component
- Add confetti animation
- Integrate badge system

### Phase 5: Integration & Polish
- Connect all components in GhostVideoProcessor
- Add error handling
- Optimize performance
- Add loading states and transitions

## Accessibility Considerations

- Provide text alternatives for visual metrics
- Ensure keyboard navigation works for all controls
- Add ARIA labels to video controls
- Provide option to reduce motion (disable confetti)
- Ensure sufficient color contrast for metrics text

## Performance Optimizations

1. **Canvas Rendering**
   - Use `requestAnimationFrame` for smooth 60 FPS
   - Implement dirty rectangle optimization
   - Cache skeleton connection paths

2. **Keyframe Loading**
   - Lazy load keyframes only when needed
   - Cache loaded keyframes in memory
   - Use compression for keyframe data

3. **Video Playback**
   - Preload user video before showing dual display
   - Use video buffering strategies
   - Optimize video codec settings

4. **Memory Management**
   - Clean up canvas contexts on unmount
   - Cancel animation frames on component unmount
   - Release video resources after playback

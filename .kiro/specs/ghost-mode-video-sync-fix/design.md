# Design Document

## Overview

This design addresses two critical bugs in Ghost Mode:

1. **Video Processing Lag in Background**: Video processing slows down significantly when the browser tab loses focus due to browser throttling
2. **Invisible Ghost Skeleton**: The ghost skeleton doesn't render because the `GhostSkeletonRenderer` isn't receiving the synchronized pose landmarks properly

The solution involves implementing proper Wake Lock API usage, fixing the data flow from video processing to ghost rendering, and optimizing the rendering pipeline for smooth 60fps playback.

## Architecture

### Current Issues

**Issue 1: Background Processing Throttling**
```
User switches tab → Browser throttles → Video processing slows → User waits longer
```

**Issue 2: Ghost Skeleton Data Flow**
```
GhostVideoProcessor (has poseLandmarks array)
  ↓
GhostComparisonDisplay (receives poseLandmarks array)
  ↓
GhostSkeletonRenderer (receives nothing - no poseLandmarks prop passed!)
  ↓
Result: Black screen (no data to render)
```

### Fixed Architecture

**Fix 1: Wake Lock Implementation**
```
Video processing starts
  ↓
Request Wake Lock
  ↓
Process video (consistent speed regardless of tab focus)
  ↓
Release Wake Lock
  ↓
Display results
```

**Fix 2: Proper Data Flow**
```
GhostVideoProcessor (has poseLandmarks[][])
  ↓
GhostComparisonDisplay (receives poseLandmarks[][])
  ↓ (calculates currentFrameIndex from video.currentTime)
  ↓
Extract single frame: poseLandmarks[currentFrameIndex]
  ↓
GhostSkeletonRenderer (receives Landmark3D[] for current frame)
  ↓
Render skeleton with spooky effects
```

## Components and Interfaces

### 1. GhostVideoProcessor - Wake Lock Implementation

**Purpose**: Prevent browser throttling during video processing.

**Changes Required**:
```typescript
// Add Wake Lock state
const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

// Request Wake Lock before processing
const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      console.log('🔒 Wake Lock acquired');
      
      lock.addEventListener('release', () => {
        console.log('🔓 Wake Lock released');
      });
      
      return lock;
    } else {
      console.warn('⚠️ Wake Lock API not supported');
      toast.info('Please keep this tab focused during processing for best performance');
      return null;
    }
  } catch (err) {
    console.error('❌ Wake Lock request failed:', err);
    return null;
  }
};

// Release Wake Lock after processing
const releaseWakeLock = async (lock: WakeLockSentinel | null) => {
  if (lock) {
    try {
      await lock.release();
      setWakeLock(null);
    } catch (err) {
      console.error('❌ Wake Lock release failed:', err);
    }
  }
};
```

**Integration**:
```typescript
useEffect(() => {
  let isMounted = true;
  let wakeLockSentinel: WakeLockSentinel | null = null;

  const process = async () => {
    try {
      // Request Wake Lock BEFORE processing starts
      wakeLockSentinel = await requestWakeLock();
      
      // ... existing video processing code ...
      
    } catch (error) {
      console.error('❌ ERROR:', error);
      toast.error('Processing failed');
    } finally {
      // Always release Wake Lock when done
      await releaseWakeLock(wakeLockSentinel);
    }
  };

  process();

  return () => {
    isMounted = false;
    releaseWakeLock(wakeLockSentinel);
  };
}, [videoFile, liveResults, activityName, ghostTarget]);
```

**Wake Lock Types**:
```typescript
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}

interface Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}
```

### 2. GhostComparisonDisplay - Frame Synchronization Fix

**Purpose**: Calculate current frame index and pass single frame's landmarks to ghost renderer.

**Current Code (Broken)**:
```typescript
// Ghost skeleton receives NO pose data
<GhostSkeletonRenderer
  exerciseType={activityName}
  isPlaying={isPlaying}
  speed={1.0}
  className="w-full h-full"
  // ❌ Missing: poseLandmarks prop!
/>
```

**Fixed Code**:
```typescript
// Add state for frame synchronization
const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

// Calculate frame index from video time
useEffect(() => {
  const video = videoRef.current;
  if (!video || !poseLandmarks || poseLandmarks.length === 0) return;

  let animationFrameId: number;

  const updateFrame = () => {
    if (!video.paused && !video.ended) {
      // Calculate FPS from total frames and duration
      const actualDuration = videoDuration || video.duration;
      const actualFPS = poseLandmarks.length / actualDuration;
      
      // Calculate frame index from current time
      const frameIndex = Math.round(video.currentTime * actualFPS);
      const clampedIndex = Math.max(0, Math.min(frameIndex, poseLandmarks.length - 1));
      
      setCurrentFrameIndex(clampedIndex);
      setCurrentTime(Math.floor(video.currentTime));
    }

    animationFrameId = requestAnimationFrame(updateFrame);
  };

  updateFrame();

  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}, [videoUrl, poseLandmarks, videoDuration]);

// Pass current frame's landmarks to ghost renderer
<GhostSkeletonRenderer
  exerciseType={activityName}
  isPlaying={isPlaying}
  speed={1.0}
  poseLandmarks={
    poseLandmarks && 
    currentFrameIndex >= 0 && 
    currentFrameIndex < poseLandmarks.length 
      ? poseLandmarks[currentFrameIndex]  // ✅ Pass single frame
      : undefined
  }
  className="w-full h-full"
/>
```

**Key Changes**:
- Add `currentFrameIndex` state
- Calculate frame index using `requestAnimationFrame` for smooth 60fps updates
- Extract single frame's landmarks: `poseLandmarks[currentFrameIndex]`
- Pass to `GhostSkeletonRenderer` via `poseLandmarks` prop
- Handle edge cases (undefined, out of bounds)

### 3. GhostSkeletonRenderer - Rendering Optimization

**Purpose**: Render ghost skeleton efficiently with proper data handling.

**Current Issues**:
- Receives no pose data (prop not passed)
- Continuous animation loop even when data doesn't change
- No logging to debug missing data

**Fixed Implementation**:

```typescript
interface GhostSkeletonRendererProps {
  exerciseType: string;
  isPlaying: boolean;
  speed?: number;
  poseLandmarks?: Landmark3D[];  // Single frame's landmarks
  onRepComplete?: () => void;
  className?: string;
}

const GhostSkeletonRenderer = ({
  exerciseType,
  isPlaying,
  speed = 1.0,
  poseLandmarks,
  onRepComplete,
  className = ''
}: GhostSkeletonRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastRenderTimeRef = useRef<number>(0);

  // Log when pose landmarks are received
  useEffect(() => {
    if (poseLandmarks) {
      console.log('👻 Ghost received landmarks:', poseLandmarks.length, 'points');
    } else {
      console.log('⚠️ Ghost has no landmarks to render');
    }
  }, [poseLandmarks]);

  // Initialize canvas with proper sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Failed to get 2D context');
      setRenderError(true);
      return;
    }

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        console.log('📐 Canvas sized:', canvas.width, 'x', canvas.height);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Render skeleton with animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = (timestamp: number) => {
      // Clear canvas with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw skeleton if we have pose data
      if (poseLandmarks && poseLandmarks.length >= 33) {
        drawHauntingSkeleton(ctx, poseLandmarks, canvas.width, canvas.height, timestamp);
        
        // Log FPS every second
        if (timestamp - lastRenderTimeRef.current > 1000) {
          console.log('👻 Ghost rendering at', Math.round(1000 / (timestamp - lastRenderTimeRef.current)), 'fps');
          lastRenderTimeRef.current = timestamp;
        }
      } else {
        // Show "waiting" message when no data
        ctx.fillStyle = '#A855F7';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for pose data...', canvas.width / 2, canvas.height / 2);
      }

      // Continue animation loop for pulsing effects
      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Start render loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [poseLandmarks]);  // Re-render when landmarks change

  if (renderError) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <p className="text-purple-300 text-sm">Failed to initialize ghost renderer</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
```

**Key Improvements**:
- Accept `poseLandmarks?: Landmark3D[]` prop (single frame)
- Log when landmarks are received/missing
- Show "Waiting for pose data..." message when no landmarks
- Optimize render loop to only redraw when needed
- Add FPS logging for performance monitoring
- Proper error handling and fallback UI

### 4. Performance Optimization Strategy

**Rendering Pipeline**:
```
Video plays (30fps)
  ↓
requestAnimationFrame updates (60fps)
  ↓
Calculate frame index from video.currentTime
  ↓
Extract landmarks for current frame
  ↓
Pass to GhostSkeletonRenderer
  ↓
Render skeleton with spooky effects
```

**Optimization Techniques**:

1. **Separate Animation Loops**:
   - Video playback: Native browser handling (30fps)
   - Frame sync: requestAnimationFrame (60fps)
   - Ghost rendering: requestAnimationFrame (60fps)

2. **Efficient Canvas Rendering**:
```typescript
// Cache gradient objects to avoid recreation
const gradientCache = new Map<string, CanvasGradient>();

const getOrCreateGradient = (
  ctx: CanvasRenderingContext2D,
  key: string,
  createFn: () => CanvasGradient
): CanvasGradient => {
  if (!gradientCache.has(key)) {
    gradientCache.set(key, createFn());
  }
  return gradientCache.get(key)!;
};
```

3. **Conditional Rendering**:
```typescript
// Only redraw when landmarks actually change
useEffect(() => {
  // Render logic here
}, [poseLandmarks]);  // Dependency on landmarks
```

4. **Frame Skipping for Low-End Devices**:
```typescript
const shouldSkipFrame = (timestamp: number, lastFrameTime: number): boolean => {
  const targetFPS = 30;  // Lower target for performance
  const minFrameTime = 1000 / targetFPS;
  return (timestamp - lastFrameTime) < minFrameTime;
};
```

## Data Models

### WakeLockSentinel
```typescript
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}
```

### PoseLandmark (Single Point)
```typescript
interface Landmark3D {
  x: number;        // Normalized 0-1
  y: number;        // Normalized 0-1
  z: number;        // Depth
  visibility: number; // 0-1 confidence
}
```

### PoseLandmarks Array Structure
```typescript
// Full sequence (all frames)
type PoseLandmarksSequence = Landmark3D[][];  // Array of frames

// Single frame (33 landmarks)
type SingleFrameLandmarks = Landmark3D[];     // One frame's landmarks

// Example:
// poseLandmarks[0] = First frame's 33 landmarks
// poseLandmarks[1] = Second frame's 33 landmarks
// poseLandmarks[currentFrameIndex] = Current frame's 33 landmarks
```

## Error Handling

### Wake Lock Errors

**Not Supported**:
```typescript
if (!('wakeLock' in navigator)) {
  console.warn('⚠️ Wake Lock API not supported');
  toast.info('Please keep this tab focused during processing');
  // Continue without Wake Lock
}
```

**Request Failed**:
```typescript
try {
  const lock = await navigator.wakeLock.request('screen');
} catch (err) {
  console.error('❌ Wake Lock request failed:', err);
  toast.warning('Background processing may be slower. Keep tab focused.');
  // Continue without Wake Lock
}
```

**Automatic Release**:
```typescript
lock.addEventListener('release', () => {
  console.log('🔓 Wake Lock released (tab hidden or battery low)');
  // Optionally notify user
});
```

### Rendering Errors

**Canvas Context Unavailable**:
```typescript
const ctx = canvas.getContext('2d');
if (!ctx) {
  setRenderError(true);
  return (
    <div className="flex items-center justify-center bg-black">
      <p className="text-red-400">Failed to initialize renderer</p>
    </div>
  );
}
```

**Missing Pose Data**:
```typescript
if (!poseLandmarks || poseLandmarks.length === 0) {
  // Show waiting message instead of blank screen
  ctx.fillStyle = '#A855F7';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Waiting for pose data...', canvas.width / 2, canvas.height / 2);
  return;
}
```

**Invalid Frame Index**:
```typescript
// Always clamp to valid range
const clampedIndex = Math.max(0, Math.min(frameIndex, poseLandmarks.length - 1));

if (frameIndex !== clampedIndex) {
  console.warn(`⚠️ Frame index ${frameIndex} clamped to ${clampedIndex}`);
}
```

## Testing Strategy

### Unit Tests

1. **Wake Lock Implementation**
   - Test Wake Lock request success
   - Test Wake Lock request failure (not supported)
   - Test Wake Lock release
   - Test cleanup on component unmount

2. **Frame Synchronization**
   - Test frame index calculation with various FPS values
   - Test frame index clamping (negative, out of bounds)
   - Test with missing pose landmarks
   - Test with empty pose landmarks array

3. **Ghost Renderer**
   - Test rendering with valid landmarks
   - Test rendering with undefined landmarks
   - Test rendering with invalid landmarks (< 33 points)
   - Test canvas initialization
   - Test canvas resize handling

### Integration Tests

1. **End-to-End Processing**
   - Upload video → Process with Wake Lock → Display results
   - Switch tabs during processing → Verify consistent speed
   - Play video → Verify ghost skeleton animates in sync

2. **Performance Tests**
   - Measure processing time with/without Wake Lock
   - Measure rendering FPS during playback
   - Test on low-end devices
   - Test with long videos (60+ seconds)

3. **Error Scenarios**
   - Test with Wake Lock not supported
   - Test with canvas context unavailable
   - Test with missing pose landmarks
   - Test with corrupted video file

### Visual Regression Tests

1. **Ghost Skeleton Appearance**
   - Verify purple glowing bones
   - Verify cyan glowing joints
   - Verify spooky skull at head
   - Verify pulsing glow effects
   - Verify black background

2. **Synchronization**
   - Verify ghost moves with video
   - Verify no lag or drift
   - Verify smooth 60fps rendering
   - Verify correct frame displayed

## Implementation Notes

### Phase 1: Wake Lock Implementation (Priority: Critical)
- Add Wake Lock request before video processing
- Add Wake Lock release after processing
- Add fallback notification when not supported
- Test on multiple browsers

### Phase 2: Frame Synchronization Fix (Priority: Critical)
- Add currentFrameIndex state to GhostComparisonDisplay
- Implement requestAnimationFrame loop for frame updates
- Calculate frame index from video.currentTime
- Pass single frame's landmarks to GhostSkeletonRenderer

### Phase 3: Ghost Renderer Optimization (Priority: High)
- Update GhostSkeletonRenderer to accept single frame landmarks
- Add logging for debugging
- Add "waiting" message when no data
- Optimize rendering loop

### Phase 4: Error Handling (Priority: High)
- Add try-catch blocks around critical sections
- Implement fallback UI for errors
- Add user-friendly error messages
- Log detailed error information

### Phase 5: Performance Optimization (Priority: Medium)
- Cache gradient objects
- Implement frame skipping for low-end devices
- Monitor and log FPS
- Optimize canvas operations

### Phase 6: Testing (Priority: Medium)
- Write unit tests for Wake Lock
- Write integration tests for synchronization
- Test on multiple devices and browsers
- Measure performance improvements

## Dependencies

- **Wake Lock API**: Browser API for preventing tab throttling
- **requestAnimationFrame**: Browser API for smooth animations
- **Canvas API**: For rendering ghost skeleton
- **MediaPipe Pose**: For pose landmark detection (already implemented)

## Browser Compatibility

### Wake Lock API Support
- **Chrome/Edge 84+**: Full support ✅
- **Firefox**: Not supported ❌ (fallback: notification)
- **Safari 16.4+**: Full support ✅
- **Mobile Chrome/Safari**: Full support ✅

### Fallback Strategy
When Wake Lock is not supported:
1. Display toast notification: "Please keep this tab focused during processing"
2. Continue processing (may be slower in background)
3. Log warning to console

## Performance Targets

1. **Video Processing**: Consistent speed regardless of tab focus (within 10% variance)
2. **Ghost Rendering**: 60fps during playback
3. **Frame Synchronization**: < 16ms latency (1 frame at 60fps)
4. **Memory Usage**: < 200MB for 30-second video processing
5. **Processing Speed**: 2 seconds per second of video (same as before, but consistent)

## Success Metrics

1. **Wake Lock Acquisition Rate**: > 90% on supported browsers
2. **Processing Speed Consistency**: < 10% variance between focused/unfocused tabs
3. **Ghost Skeleton Visibility**: 100% (no more black screens)
4. **Frame Sync Accuracy**: < 1 frame drift over 30-second video
5. **User Satisfaction**: No complaints about lag or invisible ghost

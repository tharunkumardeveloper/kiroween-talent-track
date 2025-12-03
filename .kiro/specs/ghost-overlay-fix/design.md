# Design Document: Ghost Overlay Fix

## Overview

This design transforms the ghost mode implementation from a small corner overlay to a full-screen, semi-transparent overlay that appears centered on the camera view. The ghost GIF will be positioned exactly where the user should be performing the exercise, creating a racing game-style ghost effect that allows users to compare their form directly with the reference.

## Architecture

### Component Structure

The ghost overlay will be implemented within the `GhostLiveRecorder` component, which wraps the `LiveRecorderNew` component. The layering architecture follows this structure:

```
GhostLiveRecorder (Container)
├── LiveRecorderNew (Camera + UI)
│   ├── Video Element (Layer 1 - Bottom)
│   ├── Canvas Element (Layer 1 - Bottom)
│   └── UI Controls (Layer 3 - Top)
└── Ghost Overlay (Layer 2 - Middle)
    └── Ghost GIF Image
```

### Z-Index Layering Strategy

- **Layer 1 (z-index: 10)**: Camera feed (video/canvas elements)
- **Layer 2 (z-index: 20)**: Ghost GIF overlay (semi-transparent)
- **Layer 3 (z-index: 30-50)**: UI elements (buttons, counters, timer)

## Components and Interfaces

### Modified Component: GhostLiveRecorder

**File**: `src/components/workout/GhostLiveRecorder.tsx`

**Current Structure**:
```typescript
interface GhostLiveRecorderProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}
```

**Design Changes**:

1. **Container Structure**: Use a relative positioned container to establish stacking context
2. **Ghost Overlay Positioning**: Position ghost as absolute/fixed with center alignment
3. **Responsive Scaling**: Calculate ghost size based on viewport dimensions
4. **Transparency Effect**: Apply opacity and optional glow effects

### CSS Architecture

**Ghost Overlay Styles**:
```css
.ghost-overlay-container {
  position: fixed;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-image {
  opacity: 0.4; /* Semi-transparent */
  max-width: 60vh; /* Scale based on viewport height */
  max-height: 80vh;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.6));
}
```

## Data Models

### Ghost Configuration

```typescript
interface GhostConfig {
  opacity: number; // 0.3 - 0.5
  scale: number; // Relative to viewport
  position: {
    x: 'center' | number;
    y: 'center' | number;
  };
  glow: {
    enabled: boolean;
    color: string;
    intensity: number;
  };
}
```

### Responsive Breakpoints

```typescript
interface ResponsiveConfig {
  mobile: {
    portrait: GhostConfig;
    landscape: GhostConfig;
  };
  desktop: GhostConfig;
}
```

## Implementation Details

### 1. Ghost Overlay Positioning

The ghost will be positioned using CSS flexbox centering within a fixed-position container:

```tsx
<div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
  <img
    src={ghostGif}
    alt="Ghost guide"
    className="ghost-overlay-image"
    style={{
      opacity: 0.4,
      maxWidth: '60vh',
      maxHeight: '80vh',
      filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))',
    }}
  />
</div>
```

### 2. Responsive Scaling Logic

**Desktop (Webcam)**:
- Ghost size: 60% of viewport height
- Centered horizontally and vertically
- Assumes user is ~6-8 feet from camera

**Mobile Portrait**:
- Ghost size: 50% of viewport height
- Centered with slight vertical offset for better alignment

**Mobile Landscape**:
- Ghost size: 70% of viewport height
- Centered to match typical phone camera positioning

### 3. Z-Index Management

Ensure proper layering by setting z-index values:

- LiveRecorderNew video/canvas: `z-10` (or default)
- Ghost overlay container: `z-20`
- UI elements in LiveRecorderNew: `z-30` to `z-50`

The ghost overlay container must use `pointer-events: none` to allow interaction with UI elements beneath it.

### 4. Transparency and Visual Effects

**Opacity**: Set to `0.4` (40%) for optimal visibility balance
- User can see their own body clearly
- Ghost is visible enough to guide form
- Not distracting or overwhelming

**Glow Effect**: Use CSS `filter: drop-shadow()` for ethereal appearance
- Purple glow matching ghost mode theme
- Subtle intensity to enhance visibility without distraction

### 5. Integration with LiveRecorderNew

The `GhostLiveRecorder` component wraps `LiveRecorderNew` without modifying its internal structure:

```tsx
<div className="relative w-full h-full">
  {/* Original Live Recorder - Full functionality preserved */}
  <LiveRecorderNew
    activityName={activityName}
    onBack={onBack}
    onComplete={onComplete}
  />
  
  {/* Ghost Overlay - Centered full-screen */}
  <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
    <img
      src={ghostGif}
      alt="Ghost guide"
      className="ghost-overlay-image"
      style={{...}}
    />
  </div>
</div>
```

## Error Handling

### Ghost GIF Loading Failures

- **Scenario**: Ghost GIF fails to load
- **Handling**: Display fallback message or hide ghost overlay
- **User Experience**: Allow workout to continue without ghost

```tsx
const [ghostLoaded, setGhostLoaded] = useState(false);
const [ghostError, setGhostError] = useState(false);

<img
  src={ghostGif}
  onLoad={() => setGhostLoaded(true)}
  onError={() => setGhostError(true)}
  style={{ display: ghostLoaded && !ghostError ? 'block' : 'none' }}
/>
```

### Z-Index Conflicts

- **Scenario**: UI elements appear behind ghost
- **Handling**: Ensure all interactive UI has z-index > 20
- **Verification**: Test all buttons, dialogs, and overlays

### Responsive Layout Issues

- **Scenario**: Ghost appears too large or small on certain devices
- **Handling**: Use viewport-relative units (vh, vw) with max constraints
- **Testing**: Test on various screen sizes and orientations

## Testing Strategy

### Visual Testing

1. **Ghost Positioning**: Verify ghost is centered on all screen sizes
2. **Transparency**: Confirm opacity allows user to see themselves clearly
3. **Layering**: Ensure UI elements remain interactive and visible
4. **Glow Effect**: Check that purple glow enhances visibility

### Functional Testing

1. **Camera Interaction**: Verify camera controls work with ghost overlay
2. **Recording**: Ensure recording captures camera feed, not ghost overlay
3. **UI Interaction**: Test all buttons and controls remain clickable
4. **Performance**: Monitor frame rate with ghost overlay active

### Responsive Testing

1. **Mobile Portrait**: Test ghost scaling and positioning
2. **Mobile Landscape**: Verify ghost adapts to orientation
3. **Desktop**: Confirm ghost matches webcam proportions
4. **Tablet**: Test intermediate screen sizes

### Cross-Browser Testing

1. **Chrome/Edge**: Primary testing platform
2. **Safari**: iOS and macOS compatibility
3. **Firefox**: Alternative rendering engine
4. **Mobile Browsers**: Native mobile browser testing

## Performance Considerations

### Image Optimization

- Ghost GIFs should be optimized for web delivery
- Recommended size: < 2MB
- Recommended dimensions: 720p or 1080p
- Format: GIF or WebP with animation support

### Rendering Performance

- Ghost overlay uses CSS transforms for positioning (GPU-accelerated)
- No JavaScript animation loops required
- Minimal impact on MediaPipe processing
- Canvas recording excludes ghost overlay (not captured in video)

## Accessibility

### Visual Accessibility

- Ghost opacity can be adjusted for users with visual impairments
- High contrast mode: Increase ghost opacity to 0.6
- Reduced motion: Option to disable ghost animation

### Screen Reader Support

- Ghost overlay marked with `aria-hidden="true"`
- Alternative text provided for ghost image
- UI controls remain fully accessible

## Future Enhancements

### User Customization

- Allow users to adjust ghost opacity (0.2 - 0.6)
- Toggle ghost on/off during workout
- Adjust ghost size/scale
- Choose ghost color/theme

### Advanced Features

- Multiple ghost overlays for comparison
- Ghost playback speed control
- Ghost position adjustment (left/right/up/down)
- Save custom ghost recordings

### Analytics

- Track ghost mode usage
- Measure improvement with ghost guidance
- Compare ghost vs non-ghost workout performance

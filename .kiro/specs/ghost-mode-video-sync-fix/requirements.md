# Requirements Document

## Introduction

This feature fixes critical bugs in Ghost Mode where the user video output lags during background processing and the ghost skeleton is not visible (black screen). The system currently experiences performance degradation when the browser tab is not in focus, and the ghost skeleton renderer fails to display the synchronized pose data, showing only a black screen instead of the animated skeleton with metrics.

## Glossary

- **Ghost Mode**: A competitive workout mode where users race against a reference skeleton performance
- **User Video Panel**: The video display showing the user's recorded/uploaded workout with real-time playback
- **Ghost Performance Panel**: The display showing the MediaPipe skeleton with spooky visual effects
- **Background Processing**: Video analysis that occurs when the browser tab is not actively focused
- **Frame Synchronization**: The system that ensures user video and ghost skeleton display the same pose frame simultaneously
- **Pose Landmarks**: The 33 3D coordinate points detected by MediaPipe representing body joint positions
- **Wake Lock API**: Browser API that prevents tab throttling during background processing
- **requestAnimationFrame**: Browser API for smooth 60fps rendering loops
- **Canvas Rendering**: The drawing system used to display the ghost skeleton visualization

## Requirements

### Requirement 1

**User Story:** As a user processing a workout video in Ghost Mode, I want the video processing to complete at consistent speed regardless of whether the tab is in focus, so that I don't experience delays when switching tabs.

#### Acceptance Criteria

1. WHEN the user switches to a different browser tab during video processing, THE System SHALL maintain the same processing speed as when the tab is focused.

2. THE System SHALL use the Wake Lock API to prevent browser throttling during video processing.

3. WHEN the Wake Lock API is not available, THE System SHALL display a notification to the user requesting they keep the tab focused during processing.

4. THE System SHALL log processing performance metrics (frames per second, total processing time) to verify consistent speed.

5. THE System SHALL complete video processing within 2 seconds per second of video duration regardless of tab focus state.

### Requirement 2

**User Story:** As a user watching Ghost Mode playback, I want the user video to play smoothly without lag or stuttering, so that I can accurately observe my workout form.

#### Acceptance Criteria

1. THE User Video Panel SHALL play video at a consistent frame rate of 30fps minimum during playback.

2. WHEN the video is playing, THE System SHALL use requestAnimationFrame for smooth frame updates without blocking the main thread.

3. THE System SHALL not perform heavy computations during video playback that would cause frame drops.

4. THE User Video Panel SHALL maintain smooth playback even when the ghost skeleton is rendering simultaneously.

5. WHEN frame drops are detected, THE System SHALL log performance warnings to help diagnose the issue.

### Requirement 3

**User Story:** As a user viewing the Ghost Performance Panel, I want to see the animated ghost skeleton with spooky effects, so that I can compare my performance against the ghost competitor.

#### Acceptance Criteria

1. THE Ghost Performance Panel SHALL display the MediaPipe skeleton with purple glowing bones and cyan glowing joints on a black background.

2. THE Ghost Performance Panel SHALL render the spooky skull at the head position with pulsing glow effects.

3. WHEN pose landmarks are available for the current frame, THE Ghost Performance Panel SHALL render the complete skeleton visualization.

4. THE Ghost Performance Panel SHALL update the skeleton position in sync with the user video playback.

5. WHEN no pose landmarks are available, THE Ghost Performance Panel SHALL display a black screen with a message indicating "Waiting for pose data".

### Requirement 4

**User Story:** As a user watching Ghost Mode playback, I want the ghost skeleton to move in perfect sync with my video, so that I can accurately compare our movements frame-by-frame.

#### Acceptance Criteria

1. THE System SHALL pass the current frame's pose landmarks to the GhostSkeletonRenderer component.

2. WHEN the user video advances to a new frame, THE Ghost Performance Panel SHALL render the skeleton using the pose landmarks from that exact frame index.

3. THE System SHALL calculate the frame index using the formula: Math.round(video.currentTime * actualFPS).

4. THE System SHALL clamp the frame index to valid bounds [0, poseLandmarks.length - 1] to prevent array access errors.

5. THE Ghost skeleton SHALL update at 60fps using requestAnimationFrame while displaying the correct frame based on video time.

### Requirement 5

**User Story:** As a user experiencing issues with Ghost Mode, I want detailed console logging of the synchronization status, so that developers can diagnose and fix problems quickly.

#### Acceptance Criteria

1. THE System SHALL log when the GhostSkeletonRenderer receives new pose landmarks including the array length.

2. THE System SHALL log the current frame index and video time every second during playback.

3. WHEN pose landmarks are missing or invalid, THE System SHALL log a warning with details about what data is missing.

4. THE System SHALL log canvas initialization status including dimensions and context availability.

5. THE System SHALL log performance metrics including rendering FPS and any frame drops detected.

### Requirement 6

**User Story:** As a user with a slower device, I want the ghost skeleton rendering to be optimized for performance, so that playback remains smooth even on lower-end hardware.

#### Acceptance Criteria

1. THE GhostSkeletonRenderer SHALL use a single requestAnimationFrame loop for rendering instead of multiple loops.

2. THE System SHALL only redraw the canvas when the pose landmarks change to a new frame.

3. THE System SHALL use canvas context save/restore efficiently to minimize state changes.

4. THE System SHALL avoid creating new gradient objects on every frame by caching reusable gradients.

5. WHEN rendering performance drops below 30fps, THE System SHALL log a performance warning.

### Requirement 7

**User Story:** As a user in the GhostComparisonDisplay component, I want to see both my video and the ghost skeleton side-by-side with synchronized playback, so that I can compete against the ghost effectively.

#### Acceptance Criteria

1. THE GhostComparisonDisplay SHALL pass the current frame's pose landmarks to the GhostSkeletonRenderer via the poseLandmarks prop.

2. THE GhostComparisonDisplay SHALL calculate the current frame index based on video.currentTime and the actual FPS.

3. THE GhostComparisonDisplay SHALL extract a single frame's landmarks from the poseLandmarks array using the calculated frame index.

4. THE GhostSkeletonRenderer SHALL accept either a single frame's landmarks (Landmark3D[]) or undefined as the poseLandmarks prop.

5. WHEN the GhostSkeletonRenderer receives valid pose landmarks, THE Ghost Performance Panel SHALL render the skeleton immediately without delay.

### Requirement 8

**User Story:** As a developer debugging Ghost Mode issues, I want clear error messages and fallback behavior, so that I can quickly identify and fix problems.

#### Acceptance Criteria

1. WHEN the canvas context fails to initialize, THE System SHALL display an error message "Failed to initialize ghost renderer" in the Ghost Performance Panel.

2. WHEN pose landmarks are undefined or empty, THE System SHALL display a message "Waiting for pose data" instead of a blank screen.

3. WHEN the frame index is out of bounds, THE System SHALL clamp it to valid range and log a warning.

4. WHEN the video fails to load, THE System SHALL display an error message and provide a retry option.

5. THE System SHALL wrap all rendering code in try-catch blocks to prevent crashes and log detailed error information.

# Requirements Document

## Introduction

This feature enhances the Ghost Mode workout experience by replacing static GIF overlays with dynamically generated, spooky skeleton animations that provide real-time metric comparisons. The system will display the user's workout video alongside a programmatically rendered skeleton performing the same exercise with ideal form, complete with visual metrics and celebratory feedback upon completion.

## Glossary

- **Ghost Mode**: A workout mode where users compete against a reference performance (the "ghost")
- **Skeleton Renderer**: A canvas-based component that draws animated skeleton poses using MediaPipe landmark data
- **Keyframe Animation**: Pre-defined pose sequences for each exercise type that the skeleton cycles through
- **Dual Video Display**: Side-by-side or stacked video layout showing user performance and ghost skeleton simultaneously
- **Metrics Overlay**: Real-time performance statistics displayed on both video feeds
- **Beat Ghost Badge**: Achievement awarded when user matches or exceeds ghost performance targets
- **Workout Interface**: The screen where users select upload or live recording options
- **Output Screen**: The results screen displayed after workout completion showing performance comparison

## Requirements

### Requirement 1

**User Story:** As a fitness app user, I want to see a spooky animated skeleton performing my chosen exercise, so that I have a visual reference for proper form during Ghost Mode workouts.

#### Acceptance Criteria

1. WHEN the user selects a workout in Ghost Mode and proceeds to the output screen, THE Skeleton Renderer SHALL display an animated skeleton performing the selected exercise type with smooth transitions between keyframe poses.

2. THE Skeleton Renderer SHALL draw the skeleton using purple (#A855F7) and cyan (#00FFFF) colored lines with glow effects on a pure black background (#000000).

3. THE Skeleton Renderer SHALL render a custom skull shape at the head landmark position that scales and rotates based on 3D pose data.

4. WHILE the skeleton animation is playing, THE Skeleton Renderer SHALL continuously loop through the exercise-specific keyframe sequence at a consistent frame rate.

5. THE Skeleton Renderer SHALL generate unique keyframe animations dynamically for each of the six workout types: Push-ups, Pull-ups, Sit-ups, Vertical Jump, Shuttle Run, and Sit Reach.

### Requirement 2

**User Story:** As a fitness app user, I want to see my workout video and the ghost skeleton side-by-side or stacked, so that I can compare my form and performance in real-time.

#### Acceptance Criteria

1. WHEN the user completes uploading a video with preview OR completes recording with processing, THE Output Screen SHALL display two video feeds simultaneously.

2. THE Output Screen SHALL position the user's workout video in the top section and the ghost skeleton animation in the bottom section in a stacked layout.

3. THE Output Screen SHALL maintain proper aspect ratios for both video feeds with the user video and skeleton canvas each occupying approximately 50% of the vertical screen space.

4. THE Output Screen SHALL synchronize the playback timing between the user video and the ghost skeleton animation so they progress at the same rate.

5. WHILE both videos are displayed, THE Output Screen SHALL clearly label each feed with "Your Performance" for the user video and "Ghost Performance" for the skeleton animation.

### Requirement 3

**User Story:** As a fitness app user, I want to see real-time metrics displayed on both video feeds, so that I can track my performance against the ghost's targets.

#### Acceptance Criteria

1. THE Metrics Overlay SHALL display rep count, elapsed time, and form score percentage on both the user video and ghost skeleton feeds.

2. THE Metrics Overlay SHALL use color-coded indicators where green represents good form, orange represents acceptable form, and red represents poor form.

3. THE Metrics Overlay SHALL position metrics in a non-intrusive location that does not obscure the primary workout view.

4. WHEN the user's rep count matches or exceeds the ghost's target, THE Metrics Overlay SHALL highlight the user's rep counter with a pulsing green glow effect.

5. THE Metrics Overlay SHALL update metrics in real-time as the workout video progresses without causing visual lag or stuttering.

### Requirement 4

**User Story:** As a fitness app user, I want to receive congratulations and a badge when I beat the ghost, so that I feel rewarded for my achievement.

#### Acceptance Criteria

1. WHEN the user's total reps meet or exceed the ghost target AND the user's form score is 85% or higher, THE Output Screen SHALL display a congratulatory message with celebratory animations.

2. THE Output Screen SHALL award a "Ghost Slayer" badge that is visually displayed with a trophy icon and purple/gold color scheme.

3. THE Output Screen SHALL play a brief celebratory animation including confetti particles, glow effects, and scale transitions when the badge is awarded.

4. THE Output Screen SHALL save the awarded badge to the user's profile and badge collection for future viewing.

5. IF the user does not beat the ghost, THE Output Screen SHALL display an encouraging message with suggestions for improvement and an option to retry the workout.

### Requirement 5

**User Story:** As a fitness app user, I want the ghost mode changes to only affect the ghost workout flow, so that my normal workout experience remains unchanged.

#### Acceptance Criteria

1. THE System SHALL apply the dual video display and skeleton renderer ONLY when the user accesses workouts through the Ghost Mode entry point.

2. THE System SHALL preserve the existing normal workout interface, upload screen, and output screen without modifications when accessed through non-ghost workout flows.

3. THE System SHALL NOT modify the GhostWorkoutDetail component's workout selection interface or challenge banner display.

4. THE System SHALL maintain separate code paths for ghost mode and normal mode workout processing to prevent cross-contamination of features.

5. WHEN the user navigates between ghost mode and normal mode, THE System SHALL correctly apply the appropriate UI components and processing logic for each mode.

### Requirement 6

**User Story:** As a fitness app user, I want the skeleton animation to be generated dynamically without requiring large video files, so that the app loads quickly and performs smoothly.

#### Acceptance Criteria

1. THE Skeleton Renderer SHALL generate all animations programmatically using canvas drawing operations without loading external video or GIF files for the skeleton.

2. THE Skeleton Renderer SHALL store keyframe landmark data as lightweight JSON structures with a maximum file size of 10KB per exercise type.

3. THE Skeleton Renderer SHALL use requestAnimationFrame for smooth 60fps animation rendering without blocking the main thread.

4. THE Skeleton Renderer SHALL interpolate between keyframes using linear or easing functions to create fluid motion transitions.

5. THE Skeleton Renderer SHALL complete initial rendering within 500 milliseconds of the output screen loading.

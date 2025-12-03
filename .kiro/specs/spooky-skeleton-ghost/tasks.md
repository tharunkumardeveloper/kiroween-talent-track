# Implementation Plan

- [x] 1. Create skeleton keyframe data structure and storage


  - Create `/src/data/ghostKeyframes.ts` file with TypeScript interfaces for Landmark3D, KeyframeData, and ExerciseKeyframes
  - Define keyframe sequences for Push-ups exercise (4 keyframes: plank → down → up → plank) with normalized landmark coordinates
  - Define keyframe sequences for Pull-ups exercise (3 keyframes: hang → pull → hang)
  - Define keyframe sequences for Sit-ups exercise (3 keyframes: lying → crunch → lying)
  - Define keyframe sequences for Vertical Jump exercise (4 keyframes: stand → crouch → jump → land)
  - Define keyframe sequences for Shuttle Run exercise (6 keyframes: start → sprint → turn → sprint → turn → finish)
  - Define keyframe sequences for Sit Reach exercise (3 keyframes: sit → reach → hold)
  - Export GHOST_TARGETS constant with target reps, time, and form scores for each exercise
  - _Requirements: 1.5, 6.2_


- [x] 2. Implement SkeletonRenderer component


  - [ ] 2.1 Create basic canvas setup and component structure
    - Create `/src/components/ghost/SkeletonRenderer.tsx` component with canvas element
    - Define SkeletonRendererProps interface with exerciseType, isPlaying, speed, onRepComplete, and className props
    - Set up canvas ref and context initialization in useEffect
    - Implement responsive canvas sizing that maintains aspect ratio
    - Add black background rendering (#000000)


    - _Requirements: 1.1, 1.2, 6.1_

  - [ ] 2.2 Implement skeleton drawing functions
    - Create drawSkeleton function that renders MediaPipe-style connections between landmarks
    - Implement purple (#A855F7) and cyan (#00FFFF) color scheme for bones and joints
    - Add glow effects using shadowBlur (20px) and shadowColor (#A855F7)


    - Create drawSkullHead function with custom skull shape (oval, eye sockets, nose triangle, teeth)
    - Implement skull scaling and rotation based on 3D head landmark position
    - _Requirements: 1.2, 1.3, 6.1_

  - [ ] 2.3 Implement keyframe animation logic
    - Create loadKeyframes function that loads exercise-specific pose data from ghostKeyframes.ts


    - Implement interpolatePose function using linear interpolation between two keyframes
    - Create animate function using requestAnimationFrame for 60 FPS rendering
    - Add rep counting logic that triggers onRepComplete callback when animation completes one cycle
    - Implement animation speed control using the speed prop
    - Add cleanup logic to cancel animation frames on component unmount
    - _Requirements: 1.4, 6.3, 6.4, 6.5_


- [x] 3. Create MetricsOverlay component


  - Create `/src/components/ghost/MetricsOverlay.tsx` component with MetricsOverlayProps interface
  - Implement metrics display for reps, target reps, time, and form score
  - Add color-coded form score indicators (green >85%, orange 70-85%, red <70%)
  - Create different styling for ghost vs user metrics using isGhost prop
  - Implement pulsing green glow animation when beatTarget is true
  - Position overlay in top-right corner with semi-transparent background (bg-black/60)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [ ] 4. Implement DualVideoDisplay component
  - [ ] 4.1 Create component structure and layout
    - Create `/src/components/ghost/DualVideoDisplay.tsx` component with DualVideoDisplayProps interface
    - Implement responsive layout: stacked vertical on mobile, side-by-side on desktop
    - Create UserVideoPanel sub-component for displaying user's workout video
    - Create GhostSkeletonPanel sub-component that wraps SkeletonRenderer

    - Add section labels "Your Performance" and "Ghost Performance" with badges
    - Maintain 16:9 aspect ratio for both panels
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [-] 4.2 Implement video synchronization

    - Add video element ref for user video playback
    - Create syncVideos function that keeps user video and skeleton animation in sync
    - Implement playback rate matching between video and animation
    - Add time difference detection (warn if >500ms out of sync)
    - Trigger onPlaybackComplete callback when both videos finish
    - _Requirements: 2.4_

  - [ ] 4.3 Integrate MetricsOverlay into both panels
    - Add MetricsOverlay to UserVideoPanel with user metrics
    - Add MetricsOverlay to GhostSkeletonPanel with ghost target metrics
    - Implement real-time metrics updates as video progresses
    - Add beat target detection and highlight user metrics when beating ghost
    - _Requirements: 3.1, 3.4, 3.5_

- [x] 5. Create beat ghost calculation logic

  - Create `/src/utils/ghostBeatCalculator.ts` utility file
  - Define BeatGhostResult interface with didBeat, repsDiff, timeDiff, formDiff, and badge properties
  - Implement calculateBeatGhost function that compares user metrics against ghost targets
  - Add logic: user beats ghost if reps >= target AND formScore >= 85%
  - Create GHOST_SLAYER_BADGE constant with badge data (id, name, description, icon, rarity, colors)
  - Export utility functions for use in GhostVideoProcessor
  - _Requirements: 4.1, 4.4_

- [x] 6. Implement GhostBeatScreen component

  - [x] 6.1 Create component structure and props


    - Create `/src/components/ghost/GhostBeatScreen.tsx` component with GhostBeatScreenProps interface
    - Define BadgeData interface for badge information
    - Set up component state for animation triggers
    - Add purple gradient background matching ghost mode theme
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Implement congratulations UI for beating ghost

    - Create congratulatory message with random variations ("Amazing!", "Ghost Slayed!", "Legendary!")
    - Display Ghost Slayer badge with trophy icon and purple/gold color scheme
    - Add scale-in animation for badge appearance
    - Create comparison table showing user vs ghost metrics (reps, time, form score)
    - Highlight metrics where user exceeded ghost performance
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 6.3 Implement confetti animation

    - Create canvas-based confetti particle system
    - Generate random confetti particles with purple, gold, and cyan colors
    - Implement gravity and wind physics for realistic falling motion
    - Trigger confetti burst when component mounts (if user beat ghost)
    - Add cleanup to stop animation after 5 seconds
    - _Requirements: 4.3_

  - [x] 6.4 Add encouragement UI for not beating ghost

    - Create encouraging message ("Great effort!", "You're getting closer!", "Try again!")
    - Display comparison showing how close user was to beating ghost
    - Add specific suggestions based on what user needs to improve (reps, form, or time)
    - Show "Retry Challenge" button prominently
    - _Requirements: 4.5_

  - [x] 6.5 Add action buttons

    - Create "Continue" button that calls onContinue prop
    - Create "Retry Challenge" button that calls onRetry prop
    - Style buttons with ghost mode purple theme
    - Add hover and active states with scale animations
    - _Requirements: 4.5_

- [x] 7. Modify GhostVideoProcessor to use new components

  - [x] 7.1 Update component to integrate DualVideoDisplay


    - Import DualVideoDisplay component into GhostVideoProcessor
    - Replace current video display with DualVideoDisplay component
    - Pass user video file/blob and exercise type to DualVideoDisplay
    - Calculate and pass user metrics from workout results
    - Calculate and pass ghost target metrics from GHOST_TARGETS
    - _Requirements: 2.1, 2.2, 5.1_

  - [x] 7.2 Implement beat ghost detection and badge awarding

    - Import calculateBeatGhost utility function
    - Call calculateBeatGhost when workout processing completes
    - Store beat ghost result in component state
    - Conditionally render GhostBeatScreen if user beat ghost
    - Pass badge data to onComplete callback for saving to user profile
    - _Requirements: 4.1, 4.4, 5.1_

  - [x] 7.3 Remove old ghost GIF overlay logic

    - Remove ghost overlay injection code from useEffect
    - Remove ghostEnabled, ghostLoaded, and ghostError state variables
    - Remove renderGhostButton function and ghost toggle button
    - Clean up ghost GIF loading and error handling code
    - Ensure VideoProcessor no longer receives ghostModeButton prop
    - _Requirements: 5.2, 5.4_

- [x] 8. Update badge system integration


  - Modify `/src/utils/badgeSystem.ts` to include GHOST_SLAYER_BADGE in BADGES array
  - Update badge unlock logic to handle ghost mode badge awarding
  - Ensure badge is saved to user's profile when awarded
  - Add badge to BadgesScreen display with proper icon and description
  - _Requirements: 4.4_

- [x] 9. Add error handling and loading states


  - Add try-catch blocks in SkeletonRenderer for keyframe loading failures
  - Implement fallback to default animation if keyframe loading fails
  - Add error state display in DualVideoDisplay if video fails to load
  - Create loading spinner for SkeletonRenderer while keyframes are loading
  - Add error toast notifications for critical failures
  - _Requirements: 6.5_

- [x] 10. Verify ghost mode isolation


  - Review GhostWorkoutInterface to ensure it only affects ghost mode flow
  - Verify normal WorkoutInterface remains unchanged
  - Test that WorkoutUploadScreen (non-ghost) is not affected
  - Test that LiveRecorder (non-ghost) is not affected
  - Confirm GhostWorkoutDetail component is not modified
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Performance optimization and polish



  - Implement canvas dirty rectangle optimization in SkeletonRenderer
  - Add keyframe caching to prevent redundant loading
  - Optimize video buffering in DualVideoDisplay
  - Add cleanup for canvas contexts and video elements on unmount
  - Test animation performance on low-end devices (target 60 FPS)
  - Add loading transitions between workout stages
  - _Requirements: 6.1, 6.3, 6.5_

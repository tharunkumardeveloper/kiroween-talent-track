# Requirements Document

## Introduction

This feature enhances the Ghost Mode output to provide accurate real-time metrics and proper visual rendering for both the user's performance and the ghost skeleton. Currently, the metrics display shows placeholder values (Reps: 0/25, Time: 0:00, Form: 85%) and the ghost skeleton lacks proper synchronization with the user's video. This enhancement ensures users receive accurate performance feedback and a competitive ghost experience with a 50/50 win/loss challenge.

## Glossary

- **Ghost Mode**: A competitive workout mode where users race against a reference skeleton performance
- **User Performance Panel**: The video display showing the user's recorded/uploaded workout with MediaPipe skeleton overlay and real-time metrics
- **Ghost Performance Panel**: The display showing only the MediaPipe skeleton with spooky visual effects and competitive metrics
- **MediaPipe Skeleton**: The pose landmark visualization rendered as connected joints and bones
- **Metrics Overlay**: Real-time performance statistics (reps, time, form score) displayed on video panels
- **Spooky Theme**: Visual styling with purple/cyan glowing effects, skull rendering, and haunting aesthetics
- **Competitive Metrics**: Ghost performance metrics algorithmically adjusted to create a 50/50 win/lose probability
- **Form Score**: Percentage-based assessment of exercise technique quality
- **Rep Counter**: Real-time count of completed exercise repetitions
- **Beat Highlight**: Visual indicator showing whether the user won or lost against the ghost

## Requirements

### Requirement 1

**User Story:** As a user completing a Ghost Mode workout, I want to see accurate real-time metrics on my performance panel, so that I can track my actual reps, time, and form score during playback.

#### Acceptance Criteria

1. WHEN the user's workout video plays in Ghost Mode, THE User Performance Panel SHALL display the actual rep count from the MediaPipe processing results.

2. THE User Performance Panel SHALL display elapsed time in MM:SS format that increments synchronously with video playback.

3. THE User Performance Panel SHALL display the calculated form score as a percentage based on correct reps versus total reps detected.

4. THE Metrics Overlay SHALL update the displayed values at least once per second during video playback.

5. WHEN the video completes playback, THE User Performance Panel SHALL display the final metrics matching the workout results data.

### Requirement 2

**User Story:** As a user viewing my Ghost Mode results, I want to see my workout video with a MediaPipe skeleton overlay, so that I can visualize my detected pose and form analysis.

#### Acceptance Criteria

1. THE User Performance Panel SHALL render the uploaded or recorded workout video as the base layer.

2. THE User Performance Panel SHALL overlay the MediaPipe skeleton visualization on top of the video using cyan (#00FFFF) colored connections and white joint markers.

3. THE MediaPipe skeleton SHALL synchronize frame-by-frame with the video playback without lag or drift.

4. THE User Performance Panel SHALL display the skeleton with proper scaling and positioning matching the detected pose landmarks.

5. WHEN pose landmarks are not detected in a frame, THE User Performance Panel SHALL continue video playback without rendering skeleton elements for that frame.

### Requirement 3

**User Story:** As a user competing in Ghost Mode, I want the ghost performance to show only a spooky skeleton with competitive metrics, so that I have a clear visual reference without video distractions.

#### Acceptance Criteria

1. THE Ghost Performance Panel SHALL display only the MediaPipe skeleton on a pure black background without any video content.

2. THE Ghost Performance Panel SHALL render the skeleton with spooky visual effects including purple (#A855F7) glowing bones, cyan (#00FFFF) glowing joints, and a custom skull at the head position.

3. THE Ghost Performance Panel SHALL display metrics that are algorithmically adjusted to create a 50% probability of the user winning and 50% probability of losing.

4. THE Ghost skeleton SHALL animate synchronously with the user's video playback using the same pose landmark sequence.

5. THE Ghost Performance Panel SHALL apply pulsing glow effects and haunting visual enhancements to maintain the spooky theme.

### Requirement 4

**User Story:** As a user competing against the ghost, I want the ghost metrics to be challenging but beatable, so that I have a fair competitive experience with meaningful outcomes.

#### Acceptance Criteria

1. THE System SHALL calculate ghost rep count as 115% of the user's actual reps plus a minimum of 3 additional reps.

2. THE System SHALL calculate ghost time as 110% of the user's actual time plus a minimum of 10 additional seconds.

3. THE System SHALL calculate ghost form score as the user's form score plus 5 percentage points with a minimum of 85% and maximum of 95%.

4. WHEN the user's reps are zero or time is zero, THE System SHALL use fallback target values from the ghost target configuration.

5. THE Ghost Metrics Overlay SHALL display the calculated competitive metrics in the same format as the user metrics (Reps: X/Y, Time: MM:SS, Form: Z%).

### Requirement 5

**User Story:** As a user completing a Ghost Mode workout, I want to see a clear visual indication of whether I beat the ghost, so that I understand my competitive result immediately.

#### Acceptance Criteria

1. WHEN the user's reps meet or exceed the ghost reps AND the user's form score is 85% or higher, THE System SHALL highlight the User Performance Panel with a green border or glow effect.

2. WHEN the user does not beat the ghost, THE System SHALL highlight the Ghost Performance Panel with a purple border or glow effect.

3. THE System SHALL display a "Victory" badge or indicator on the winning panel after video playback completes.

4. THE System SHALL calculate the beat result based on final metrics after complete video processing.

5. THE beat result indicator SHALL remain visible until the user closes the Ghost Mode results screen.

### Requirement 6

**User Story:** As a user uploading or recording a workout video, I want the video processing to extract accurate metrics, so that my Ghost Mode results reflect my actual performance.

#### Acceptance Criteria

1. THE Video Processor SHALL extract the total rep count from the live results object using all available data sources (setsCompleted, stats.totalReps, stats.correctReps).

2. THE Video Processor SHALL parse the duration from the live results in both string format (MM:SS) and numeric format (seconds).

3. THE Video Processor SHALL calculate form score as the ratio of correct reps to total reps multiplied by 100.

4. THE Video Processor SHALL extract pose landmarks frame-by-frame at 30 FPS from the uploaded or recorded video.

5. THE Video Processor SHALL store the extracted pose landmark sequence for synchronized playback in both user and ghost panels.

### Requirement 7

**User Story:** As a user watching Ghost Mode playback, I want smooth video and skeleton synchronization without lag, so that I can accurately compare my form to the ghost.

#### Acceptance Criteria

1. THE System SHALL use requestAnimationFrame for smooth frame updates during video playback.

2. THE System SHALL calculate the current frame index based on video.currentTime multiplied by the actual FPS (frames per second).

3. THE System SHALL clamp the frame index to valid bounds (0 to poseLandmarks.length - 1) to prevent array access errors.

4. THE System SHALL update both user and ghost skeleton renderers with the same frame index to maintain synchronization.

5. THE System SHALL log synchronization status every second during playback for debugging purposes without impacting performance.

### Requirement 8

**User Story:** As a user on a mobile or desktop device, I want the Ghost Mode display to work without video lag or performance issues, so that I have a smooth viewing experience.

#### Acceptance Criteria

1. THE System SHALL process video frames at a consistent 30 FPS during pose extraction.

2. THE System SHALL display a progress indicator showing percentage completion during video processing.

3. THE System SHALL use wake lock API to prevent the browser tab from sleeping during background processing.

4. THE System SHALL notify the user if the tab is hidden during processing and confirm that processing continues.

5. THE System SHALL complete video processing and pose extraction within 2 seconds per second of video duration (e.g., 60 seconds for a 30-second video).

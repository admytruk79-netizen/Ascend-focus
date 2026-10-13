# Optional movement demonstrations

Implemented for finger-unfolding and thumb-circles: custom SVG hand sketches,
bronze/parchment gradients, subtle stationary ambient detail, manual still-frame
selector, explicit Play/Pause/Replay and reset. These are modern teaching aids,
not exact anatomical diagrams, historical timings or mandated movement ranges.
A one-pass18-second demonstration is an editorial animation duration, never a
practice dose. Source protocols and source page references unchanged.

Static by default; Quiet Mode OR OS reduced motion denies animation. Changing
those settings never restarts playback automatically. Background stops playback
and requires explicit replay; mounted cleanup cancels requestAnimationFrame.
Starting practice disables demonstration motion; its time never enters session
progress or scoring. Historical view has no animation. Manual frames and text
remain available; no camera or eye-tracking used.

Verification: unit sequence/range/static guards, mobile browser play/pause, quiet,
OS change, background, no automatic resume, and start-practice stop. Screenshot
evidence captured from real SVG rendering in CI. Device/manual accessibility
review still pending; no signed mobile release claim.

## Studio rendering refinement

Implemented: layered vector shading, soft contact shadows, directional bronze
key/rim light, finger crease and nail cues, depth ordering of orbiting thumbs,
stationary vignette and a restrained progress arc. Rendering targets one update
per display frame (16ms minimum); sequential finger easing remains smoothstep.
The scene has no idle loops, camera movement, flashing or animated background.
Lighting, still-frame selection and text remain available with reduced motion.
These are stylized illustrations, not anatomically validated models. The
18-second modern demonstration timing and historical content are unchanged.

## Deliberate movement choreography

Finger transitions now use quintic easing with a 12% dwell at either end of
each step. This preserves the opening/reverse-closing sequence and gives each
pose a moment to settle. Captions describe the gesture underway; still-frame
controls expose the same description to assistive technology. A user-selected
slow pace doubles the modern illustration to 36 seconds. Changing pace pauses
at the current position and requires Play; it never changes the practice timer
or historical timing. Palm-side fingertip highlights are deliberately subtle.
Tests cover monotonic/symmetric poses, caption boundaries, pace changes,
preserved pause position and keyboard still-frame selection during playback.

## Articulated illustration rig

The finger study now uses three projected joints per finger with independent
curl angles, tapered silhouettes and palm-side occlusion. Fingers fold into the
palm rather than shrinking into straight bars; the open hand has a slight
oblique presentation and natural spread. The thumb has separate joints, and
the paired-thumb study uses the same tapered rendering. Soft joint creases,
subtle palm contours and a small active-finger indicator support legibility.
This is an editorial teaching illustration, not an anatomically validated
simulation or additional historical instruction. Geometry tests verify finite
poses, tapering, symmetry and the original opening/closing sequence. Browser
evidence includes a real mid-motion frame as well as still-frame closeups.

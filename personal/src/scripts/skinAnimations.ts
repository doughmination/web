/**
 * Custom skinview3d animations.
 *
 * Why not use skinview3d's built-in WaveAnimation? It contains a units bug:
 *
 *   targetArm.rotation.x = 180;              // three.js rotations are RADIANS
 *   targetArm.rotation.z = Math.sin(t) * 0.5;
 *
 * 180 radians wraps to ~4.07 rad (233 degrees), so the arm lands at an
 * essentially arbitrary pose — almost certainly `Math.PI` was intended. The
 * result reads as a stiff raised-arm salute rather than a wave, which is not
 * something to ship. This module replaces it.
 */

type Sv = typeof import("skinview3d");
type Player = Parameters<ConstructorParameters<Sv["FunctionAnimation"]>[0]>[0];

/** Which side waves. Minecraft arms are a single rigid box — there is no elbow. */
export type WaveArm = "left" | "right";

/**
 * A wave that reads as a wave.
 *
 * Two deliberate choices keep it clearly friendly:
 *
 * 1. `rotation.x` stays at 0. Any forward reach puts the arm on a diagonal in
 *    front of the body, which is the pose that reads as a salute. Keeping the
 *    arm in the coronal plane (straight out to the side) avoids that entirely.
 *
 * 2. The arm is raised high — near vertical, hand above the head — rather than
 *    at roughly 45 degrees. Combined with (1), the silhouette is unambiguous.
 *
 * The hand then oscillates around that raised position, which is the actual
 * "wave". Because the arm is one rigid box, the pivot is the shoulder; a
 * shallow swing looks like a wrist wave at this scale, so SWING is kept small.
 */
export function createWave(sv: Sv, arm: WaveArm = "right") {
  // Arm hangs down at rotation 0. Rotating about Z sweeps it out to the side;
  // ~2.7 rad (~155 deg) puts the hand up beside the head.
  const RAISED = 2.7;
  // Half-width of the wave, in radians. Small = wrist-like rather than flailing.
  const SWING = 0.22;
  // Waves per animation cycle.
  const SPEED = 3;

  // The player's right arm sits at -X, so it must rotate the opposite direction
  // to swing away from the body rather than across it.
  const dir = arm === "right" ? -1 : 1;

  return new sv.FunctionAnimation((player: Player, progress: number) => {
    const skin = player.skin;
    const target = arm === "right" ? skin.rightArm : skin.leftArm;
    const other = arm === "right" ? skin.leftArm : skin.rightArm;

    const t = progress * Math.PI * 2 * SPEED;

    // Raised, swinging arm — no forward component.
    target.rotation.x = 0;
    target.rotation.z = dir * (RAISED + Math.sin(t) * SWING);

    // Gentle idle sway on everything else so the pose doesn't look frozen.
    const idle = Math.sin(progress * Math.PI * 2) * 0.06;
    other.rotation.x = idle;
    other.rotation.z = dir * -0.05;
    skin.rightLeg.rotation.x = idle * 0.5;
    skin.leftLeg.rotation.x = -idle * 0.5;
    // A small head tilt toward the waving arm reads as acknowledgement.
    skin.head.rotation.z = dir * 0.05;
    skin.head.rotation.y = dir * -0.08;
  });
}

/**
 * The detection panel the Dump tab (`CameraIdentity`) and the offline decryptor show. Its score says what
 * it was taken from, as the Info tab's log ("probe: …, score 0.85 from the answers above, before any bank is
 * read") and Profile panel ("score 0.98 after the read, from the evidence below") do; it was labelled
 * "Confidence 0.85 of 1.00" (TESTING.md 42.86 §7, 42.87).
 */

import { describe, expect, it } from 'vitest';
import { getProfile, type DetectionResult } from '@seek-fw/core';
import { DetectionBox } from './DetectionBox';
import { CameraIdentity } from './CameraIdentity';
import { render } from '../test-helpers';

const PROBE: DetectionResult = {
  best: {
    profile: getProfile('compact-2016'),
    score: 0.85,
    reasons: ["the camera reports firmware 1.0.3.0, the 2016 Compact PRO's 1.0.3.x line"],
  },
  ranked: [],
  ambiguous: false,
};

describe('DetectionBox', () => {
  it('labels the probe’s score on the Dump tab as taken before any bank is read', () => {
    const { container, unmount } = render(
      <CameraIdentity
        acting={{
          profile: getProfile('compact-2016'),
          detection: PROBE,
          firmwareVersion: '1.0.3.0',
          buildString: 'Jul  6 2016',
        }}
        refusal={null}
      />,
    );
    const text = container.textContent;
    expect(text).toContain('Score');
    expect(text).toContain("0.85 of 1.00, from the camera's answers, before any bank is read");
    expect(text).not.toContain('Confidence');
    unmount();
  });

  it('labels the offline score as taken from the file', () => {
    const { container, unmount } = render(
      <DetectionBox detection={PROBE} scoreBasis="from the images in the file" />,
    );
    expect(container.textContent).toContain('0.85 of 1.00, from the images in the file');
    expect(container.textContent).not.toContain('Confidence');
    unmount();
  });
});

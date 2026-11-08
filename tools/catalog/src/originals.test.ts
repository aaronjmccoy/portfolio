import { describe, expect, it } from 'vitest';
import { groupPhotos, titleFromHandle } from './originals.ts';

const files = [
  'email.png',
  'feather-bedfellows-study-closeup-2.jpg',
  'feather-bedfellows-study-closeup.jpg',
  'feather-bedfellows-study.jpg',
  'flaunt.jpg',
  'hero-peacock.jpg',
  'instagram.png',
  'mask-man.jpg',
  'starstuff-eye.jpg',
  'starstuff-full.jpg',
  'starstuff-head.jpg',
  'the-bishop-closeup.jpg',
  'the-bishop-edge.jpg',
  'the-bishop.jpg',
  'three-brothers-wings-2.jpg',
  'three-brothers-wings.jpg',
  'three-brothers.jpg',
  'notes.txt',
];

describe('groupPhotos', () => {
  const sets = groupPhotos(files, new Set(['hero-peacock', 'email', 'instagram']));
  const by = Object.fromEntries(sets.map((s) => [s.handle, s.files]));

  it('groups details under the bare name, main shot first', () => {
    expect(by['the-bishop']).toEqual(['the-bishop.jpg', 'the-bishop-closeup.jpg', 'the-bishop-edge.jpg']);
    expect(by['three-brothers']).toEqual(['three-brothers.jpg', 'three-brothers-wings-2.jpg', 'three-brothers-wings.jpg']);
    expect(by['feather-bedfellows-study']).toEqual([
      'feather-bedfellows-study.jpg',
      'feather-bedfellows-study-closeup-2.jpg',
      'feather-bedfellows-study-closeup.jpg',
    ]);
  });

  it('groups a set with no bare file by its shared stem, -full first', () => {
    expect(by['starstuff']).toEqual(['starstuff-full.jpg', 'starstuff-eye.jpg', 'starstuff-head.jpg']);
  });

  it('keeps single files as their own set and honours skips and non-images', () => {
    expect(by['flaunt']).toEqual(['flaunt.jpg']);
    expect(by['mask-man']).toEqual(['mask-man.jpg']);
    expect(Object.keys(by)).not.toContain('hero-peacock');
    expect(Object.keys(by)).not.toContain('notes');
    expect(Object.keys(by).sort()).toEqual(['feather-bedfellows-study', 'flaunt', 'mask-man', 'starstuff', 'the-bishop', 'three-brothers']);
  });

  it('titles from handles', () => {
    expect(titleFromHandle('the-bishop')).toBe('The Bishop');
    expect(sets.find((s) => s.handle === 'three-brothers')?.title).toBe('Three Brothers');
  });
});

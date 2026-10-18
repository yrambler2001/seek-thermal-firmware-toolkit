import { describe, expect, it } from 'vitest';
import { firmwareLineOf } from './family-line';

describe('firmwareLineOf', () => {
  it('puts 0.x and 1.x on the 2014 and 2016 line', () => {
    expect(firmwareLineOf('0.9.0.2')).toBe('legacy');
    expect(firmwareLineOf('1.0.3.0')).toBe('legacy');
    expect(firmwareLineOf('1.3.0.8')).toBe('legacy');
  });

  it('puts every other major on the 4.x/Nano line, Mosaic and Nano included', () => {
    expect(firmwareLineOf('4.18.2.0')).toBe('modern');
    expect(firmwareLineOf('10.9.1.31')).toBe('modern');
    expect(firmwareLineOf('2.27.1.33')).toBe('modern');
    expect(firmwareLineOf('42.32.3.10')).toBe('modern');
    expect(firmwareLineOf('44.27.3.10')).toBe('modern');
  });

  it('says nothing about a version it cannot read', () => {
    expect(firmwareLineOf(null)).toBeNull();
    expect(firmwareLineOf('')).toBeNull();
    expect(firmwareLineOf('x.y')).toBeNull();
  });
});

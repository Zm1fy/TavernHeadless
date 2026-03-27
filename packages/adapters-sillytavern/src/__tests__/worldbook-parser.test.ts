import { describe, it, expect } from 'vitest';
import { parseWorldBook } from '../parsers/worldbook-parser.js';
import { WI_POSITION } from '../types/worldbook.js';

describe('parseWorldBook', () => {
  it('parses object-style entries', () => {
    const json = {
      entries: {
        '0': {
          uid: 0,
          key: ['Alice'],
          content: 'Alice is a mage.',
          comment: 'Alice entry',
        },
        '1': {
          uid: 1,
          key: ['Bob'],
          content: 'Bob is a knight.',
        },
      },
    };

    const wb = parseWorldBook(json, 'Test Book');

    expect(wb.name).toBe('Test Book');
    expect(wb.entries).toHaveLength(2);
    expect(wb.entries[0]!.key).toEqual(['Alice']);
    expect(wb.entries[0]!.content).toBe('Alice is a mage.');
    expect(wb.entries[0]!.comment).toBe('Alice entry');
    // Default values
    expect(wb.entries[0]!.selective).toBe(true);
    expect(wb.entries[0]!.constant).toBe(false);
    expect(wb.entries[0]!.position).toBe(0); // BEFORE
    expect(wb.entries[0]!.order).toBe(100);
    expect(wb.entries[0]!.disable).toBe(false);
  });

  it('parses array-style entries (v2 character_book)', () => {
    const json = {
      entries: [
        {
          keys: ['dragon'],
          secondary_keys: ['fire'],
          content: 'A fire dragon.',
          enabled: true,
          insertion_order: 50,
          selective: true,
        },
      ],
    };

    const wb = parseWorldBook(json);
    expect(wb.entries).toHaveLength(1);
    expect(wb.entries[0]!.key).toEqual(['dragon']);
    expect(wb.entries[0]!.keysecondary).toEqual(['fire']);
    expect(wb.entries[0]!.order).toBe(50);
    expect(wb.entries[0]!.disable).toBe(false);
  });

  it('parses nested character_book payload', () => {
    const json = {
      character_book: {
        entries: [
          {
            keys: ['city'],
            content: 'The city has seven gates.',
          },
        ],
      },
    };

    const wb = parseWorldBook(json);
    expect(wb.entries).toHaveLength(1);
    expect(wb.entries[0]!.key).toEqual(['city']);
    expect(wb.entries[0]!.content).toBe('The city has seven gates.');
  });

  it('parses nested data.character_book payload', () => {
    const json = {
      data: {
        character_book: {
          entries: [
            {
              key: ['archive'],
              content: 'The archive opens at dawn.',
            },
          ],
        },
      },
    };

    const wb = parseWorldBook(json);
    expect(wb.entries).toHaveLength(1);
    expect(wb.entries[0]!.key).toEqual(['archive']);
    expect(wb.entries[0]!.content).toBe('The archive opens at dawn.');
  });

  it('handles v2 extensions fields', () => {
    const json = {
      entries: {
        '0': {
          uid: 0,
          key: ['test'],
          content: 'test',
          extensions: {
            position: 4, // AT_DEPTH
            depth: 2,
            role: 1, // USER
            scan_depth: 5,
            case_sensitive: true,
            match_whole_words: true,
          },
        },
      },
    };

    const wb = parseWorldBook(json);
    const entry = wb.entries[0]!;

    expect(entry.position).toBe(4);
    expect(entry.depth).toBe(2);
    expect(entry.role).toBe(1);
    expect(entry.scanDepth).toBe(5);
    expect(entry.caseSensitive).toBe(true);
    expect(entry.matchWholeWords).toBe(true);
  });

  it('maps string position to numeric enum', () => {
    const json = {
      entries: [
        { key: ['a'], content: 'a', position: 'after_char' },
        { key: ['b'], content: 'b', position: 'before_an' },
      ],
    };

    const wb = parseWorldBook(json);
    expect(wb.entries[0]!.position).toBe(WI_POSITION.AFTER);
    expect(wb.entries[1]!.position).toBe(WI_POSITION.AN_TOP);
  });

  it('maps extensions string position with higher priority', () => {
    const json = {
      entries: [
        {
          key: ['a'],
          content: 'a',
          position: 'before_char',
          extensions: {
            position: 'at_depth',
          },
        },
      ],
    };

    const wb = parseWorldBook(json);
    expect(wb.entries[0]!.position).toBe(WI_POSITION.AT_DEPTH);
  });

  it('maps v2 enabled to disable', () => {
    const json = {
      entries: [
        { key: ['a'], content: 'a', enabled: false },
        { key: ['b'], content: 'b', enabled: true },
      ],
    };

    const wb = parseWorldBook(json);
    expect(wb.entries[0]!.disable).toBe(true);
    expect(wb.entries[1]!.disable).toBe(false);
  });

  it('assigns uid from index when missing', () => {
    const json = {
      entries: [
        { key: ['a'], content: 'a' },
        { key: ['b'], content: 'b' },
      ],
    };

    const wb = parseWorldBook(json);
    expect(wb.entries[0]!.uid).toBe(0);
    expect(wb.entries[1]!.uid).toBe(1);
  });

  it('uses provided name or fallback', () => {
    expect(parseWorldBook({ entries: [] }, 'My Book').name).toBe('My Book');
    expect(parseWorldBook({ entries: [], name: 'JSON Name' }).name).toBe('JSON Name');
    expect(parseWorldBook({ entries: [] }).name).toBe('Unnamed');
  });

  it('fills default global settings', () => {
    const wb = parseWorldBook({ entries: [] });
    expect(wb.scanDepth).toBe(2);
    expect(wb.caseSensitive).toBe(false);
    expect(wb.matchWholeWords).toBe(false);
    expect(wb.recursive).toBe(false);
    expect(wb.maxRecursionSteps).toBe(0);
  });

  it('handles empty entries', () => {
    const wb = parseWorldBook({ entries: {} });
    expect(wb.entries).toHaveLength(0);
  });
});

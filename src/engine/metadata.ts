/**
 * Publishing metadata derived from a {@link VideoSpec}: the YouTube title,
 * description and tags, plus the small content model the thumbnail renders.
 * Pure logic — no rendering, fully unit-tested — so the actual numbers and copy
 * are decided here, not buried in a React component.
 */

import type { ThemeName, VideoSpec } from './types';

export interface VideoMetadata {
  /** YouTube title, capped at 100 characters. */
  title: string;
  description: string;
  /** Search tags; the joined list is kept under YouTube's 500-char limit. */
  tags: string[];
}

export interface ThumbnailModel {
  /** Big top line, e.g. "3× Table" or "Times Tables". */
  headline: string;
  /** Representative question shown as the hook, e.g. "3 × 7". */
  heroPrompt: string;
  /** Playful badge, e.g. "Beat the Clock!". */
  badge: string;
  /** e.g. "Ages 7–9". */
  ageLabel: string;
  theme: ThemeName;
}

const TITLE_MAX = 100;
const TAGS_TOTAL_MAX = 500; // YouTube counts the comma-joined length.

/** Distinct tables featured, ascending. For multiply, operand[0] is the table. */
function featuredTables(spec: VideoSpec): number[] {
  const set = new Set<number>();
  for (const q of spec.questions) {
    const first = q.operands[0];
    if (first !== undefined) set.add(first);
  }
  return [...set].sort((a, b) => a - b);
}

function ageLabel(spec: VideoSpec): string {
  return `Ages ${spec.ageRange[0]}–${spec.ageRange[1]}`;
}

export function buildThumbnailModel(spec: VideoSpec): ThumbnailModel {
  const tables = featuredTables(spec);
  const hero = spec.questions[Math.floor(spec.questions.length / 2)] ?? spec.questions[0];
  return {
    headline: tables.length === 1 ? `${tables[0]}× Table` : 'Times Tables',
    heroPrompt: hero ? hero.prompt : '3 × 7',
    badge: 'Beat the Clock!',
    ageLabel: ageLabel(spec),
    theme: spec.theme,
  };
}

export function buildMetadata(spec: VideoSpec): VideoMetadata {
  const tables = featuredTables(spec);
  return {
    title: clamp(spec.title, TITLE_MAX),
    description: buildDescription(spec, tables),
    tags: clampTags(buildTags(tables), TAGS_TOTAL_MAX),
  };
}

function buildDescription(spec: VideoSpec, tables: number[]): string {
  const focus =
    tables.length === 1
      ? `the ${tables[0]} times table`
      : `the ${listToText(tables)} times tables`;
  const sample = spec.questions.slice(0, 3).map((q) => q.prompt).join(', ');
  return [
    '⏱️ Can you beat the clock? Answer each question before the timer runs out!',
    '',
    `This speed quiz covers ${focus} — quick mental-maths practice for kids ${ageLabel(spec).toLowerCase()}.`,
    '',
    '👉 Play along out loud, then check your answer when it pops up.',
    '🔔 Subscribe for a new times-tables quiz every day!',
    '',
    `In this video: ${sample} … and more.`,
    '',
    buildHashtags(tables),
  ].join('\n');
}

function buildHashtags(tables: number[]): string {
  const tags = ['#timestables', '#mathsforkids', '#mentalmaths', '#multiplication', '#shorts'];
  if (tables.length === 1) tags.unshift(`#${tables[0]}timestable`);
  return tags.join(' ');
}

function buildTags(tables: number[]): string[] {
  const perTable = tables.map((t) => `${t} times table`);
  const base = [
    'times tables',
    'times tables for kids',
    'multiplication',
    'mental maths',
    'maths for kids',
    'math for kids',
    'maths quiz',
    'times tables quiz',
    'beat the clock',
    'primary maths',
    'multiplication practice',
    'times tables practice',
    'learn times tables',
    'maths shorts',
  ];
  return dedupe([...perTable, ...base]);
}

/** Keeps tags whose comma-joined length stays within the limit. */
function clampTags(tags: string[], maxChars: number): string[] {
  const out: string[] = [];
  let length = 0;
  for (const tag of tags) {
    const added = (out.length === 0 ? 0 : 1) + tag.length; // separator + tag
    if (length + added > maxChars) break;
    out.push(tag);
    length += added;
  }
  return out;
}

function clamp(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function listToText(items: readonly number[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}

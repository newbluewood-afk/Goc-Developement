#!/usr/bin/env node
'use strict';

/**
 * Safe AI / RAG diagnostics (no secrets printed).
 * Usage: node scripts/ai-smokecheck.js [--live]
 *   --live  call Anthropic, Qdrant, embedding HTTP (needs network + valid .env)
 */

require('dotenv').config();

const fetch = require('node-fetch');

function maskKey(k) {
  if (!k || typeof k !== 'string') return '(nije postavljen)';
  const t = k.trim();
  if (!t) return '(prazan string)';
  const tail = t.length > 6 ? t.slice(-4) : '****';
  return `postavljen (${t.length} znakova, završava na …${tail})`;
}

async function checkAnthropic() {
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'claude-sonnet-4-6';
  if (!key || !String(key).trim()) {
    return { ok: false, detail: 'AI_API_KEY nije postavljen' };
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': String(key).trim(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 16,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    }),
    timeout: 20000,
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, detail: `HTTP ${res.status} — ${text.slice(0, 220)}` };
  }
  let snippet = '';
  try {
    const j = JSON.parse(text);
    snippet = j.content?.[0]?.text || '';
  } catch (_) {
    snippet = text.slice(0, 80);
  }
  return { ok: true, detail: `model=${model} odgovor: ${String(snippet).slice(0, 80)}` };
}

async function checkQdrant() {
  const base = (process.env.QDRANT_URL || 'http://127.0.0.1:6333').replace(/\/+$/, '');
  const res = await fetch(`${base}/collections`, { timeout: 5000 });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    return { ok: false, detail: `HTTP ${res.status} ${t.slice(0, 120)}` };
  }
  const j = await res.json().catch(() => ({}));
  const names = (j.result?.collections || []).map((c) => c.name).filter(Boolean);
  const hasSiteKb = names.includes('site_kb');
  return {
    ok: true,
    detail: `${names.length} kolekcija; site_kb=${hasSiteKb ? 'da' : 'NE (seed: npm run seed:site-kb)'}`,
  };
}

async function checkEmbedding() {
  const provider = process.env.EMBEDDING_PROVIDER || 'local';
  if (provider === 'openai') {
    const k = process.env.OPENAI_API_KEY;
    if (!k || !String(k).trim()) {
      return { ok: false, detail: 'OPENAI_API_KEY nedostaje za EMBEDDING_PROVIDER=openai' };
    }
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${String(k).trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: 'ok' }),
      timeout: 20000,
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status} — ${text.slice(0, 180)}` };
    const j = JSON.parse(text);
    const dim = j.data?.[0]?.embedding?.length;
    return { ok: true, detail: `OpenAI embedding dim=${dim || '?'}` };
  }

  if (provider === 'huggingface') {
    return { ok: true, detail: 'HF: preskačem živi poziv (rate limit); proverite ručno.' };
  }

  const url = `${(process.env.EMBEDDING_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')}/embed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'smoke' }),
    timeout: 5000,
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status} ${text.slice(0, 120)}` };
  let dim;
  try {
    const j = JSON.parse(text);
    dim = Array.isArray(j.vector) ? j.vector.length : Array.isArray(j.embedding) ? j.embedding.length : null;
  } catch (_) {
    dim = null;
  }
  return { ok: true, detail: `local ${url} dim=${dim ?? '?'}` };
}

async function checkSiteGuideLogic() {
  const { composeSiteGuideTurn } = require('../services/siteGuideService');
  const turn = await composeSiteGuideTurn({
    message: 'koji je danas dan',
    lang: 'sr',
    userKey: 'smokecheck',
  });
  const src = turn.meta?.source;
  const reason = turn.meta?.reason;
  return {
    ok: src === 'server_clock',
    detail:
      src === 'server_clock'
        ? 'datum sa servera (bez LLM)'
        : `očekivano meta.source=server_clock, dobijeno reason=${reason || src || 'n/a'}`,
  };
}

async function main() {
  const live = process.argv.includes('--live');

  const aiEnabled = process.env.AI_ENABLED !== 'false';
  const provider = process.env.AI_PROVIDER || 'mock';

  console.log('=== Konfiguracija (.env) ===\n');
  console.log(`AI_ENABLED       = ${process.env.AI_ENABLED ?? '(nije set)'} → efektivno: ${aiEnabled}`);
  console.log(`AI_PROVIDER      = ${provider}`);
  console.log(`AI_API_KEY       = ${maskKey(process.env.AI_API_KEY)}`);
  console.log(`AI_MODEL         = ${process.env.AI_MODEL || '(default u kodu)'}`);
  console.log(`EMBEDDING_PROVIDER = ${process.env.EMBEDDING_PROVIDER || 'local'}`);
  console.log(`EMBEDDING_URL    = ${process.env.EMBEDDING_URL || '(default 127.0.0.1:8000)'}`);
  console.log(`OPENAI_API_KEY   = ${maskKey(process.env.OPENAI_API_KEY)}`);
  console.log(`QDRANT_URL       = ${process.env.QDRANT_URL || 'http://127.0.0.1:6333'}`);
  console.log('');

  console.log('=== Logika (bez mreže) ===\n');
  try {
    const g = await checkSiteGuideLogic();
    console.log(`Vodič „koji je danas dan”: ${g.ok ? 'OK' : 'PROBLEM'} — ${g.detail}`);
  } catch (e) {
    console.log(`Vodič compose: GREŠKA — ${e.message}`);
  }
  console.log('');

  if (!live) {
    console.log('Živi pozivi (Anthropic / Qdrant / embed) preskočeni. Pokrenite:');
    console.log('  node scripts/ai-smokecheck.js --live\n');
    if (!aiEnabled || provider === 'mock') {
      console.log(
        'Napomena: kod AI_ENABLED=false ili AI_PROVIDER=mock, Vodič NE zove Claude — ' +
          'samo ključne reči + datum sa servera. To je očekivano ponašanje, ne greška LLM-a.'
      );
    }
    return;
  }

  console.log('=== Živi pozivi (--live) ===\n');

  if (aiEnabled && provider !== 'mock') {
    try {
      const a = await checkAnthropic();
      console.log(`Anthropic Messages: ${a.ok ? 'OK' : 'NE'} — ${a.detail}`);
    } catch (e) {
      console.log(`Anthropic: NE — ${e.message}`);
    }
  } else {
    console.log(
      'Anthropic: PRESKOČENO (AI isključen ili mock). Uključite AI_ENABLED=true, AI_PROVIDER=anthropic, AI_API_KEY=…'
    );
  }

  try {
    const q = await checkQdrant();
    console.log(`Qdrant: ${q.ok ? 'OK' : 'NE'} — ${q.detail}`);
  } catch (e) {
    console.log(`Qdrant: NE — ${e.message}`);
  }

  try {
    const e = await checkEmbedding();
    console.log(`Embedding: ${e.ok ? 'OK' : 'NE'} — ${e.detail}`);
  } catch (err) {
    console.log(`Embedding: NE — ${err.message}`);
  }

  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

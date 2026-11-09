#!/usr/bin/env node
/**
 * Build curated pSEO category pages from data/pseo-categories.json.
 * Run: node scripts/build-pseo.mjs
 * The root homepage is intentionally never read or modified.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/pseo-categories.json'), 'utf8'));
const origin = 'https://namegeneratorforbaby.com';

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugText = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const pages = [];

for (const category of data.categories) {
  const url = `${origin}/${category.slug}/`;
  const cards = category.names.map(([name, originName, meaning, pronunciation]) =>
    `<article class="name-card"><div class="name-top"><h3>${esc(name)}</h3><span class="pronunciation">${esc(pronunciation)}</span></div><p class="meaning">${esc(meaning)}</p><p class="origin">${esc(originName)}</p></article>`
  ).join('\n');

  const faq = [
    {q:`What should I consider when choosing ${category.title.toLowerCase()}?`,a:'Consider how the name sounds with your surname, how it is spelled and pronounced where you live, and whether its cultural background and meaning feel appropriate to your family.'},
    {q:'Are name meanings always exact?',a:'No. Etymologies can be debated, and meanings may change across languages, historical periods and spelling traditions. Treat short meaning notes as a starting point for further research.'},
    {q:'How can I find more names like these?',a:'Explore the other curated collections linked on this page, compare pronunciation and origin, and make a shortlist to say aloud with your family surname.'}
  ];
  const faqHtml = faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  const schema = {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'CollectionPage','name':category.title,'description':category.description,'url':url},
      {'@type':'ItemList','name':category.title,'numberOfItems':category.names.length,'itemListElement':category.names.map((n,i)=>({'@type':'ListItem','position':i+1,'item':{'@type':'Thing','name':n[0],'description':n[2]+' ('+n[1]+')'}}))},
      {'@type':'FAQPage','mainEntity':faq.map(f=>({'@type':'Question','name':f.q,'acceptedAnswer':{'@type':'Answer','text':f.a}}))}
    ]
  };
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(category.title)} | Baby Name Generator</title>
<meta name="description" content="${esc(category.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(category.title)} | Baby Name Generator">
<meta property="og:description" content="${esc(category.description)}"><meta property="og:url" content="${url}">
<meta name="theme-color" content="#f8e8f1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>
<style>
:root{--pink:#f7b8d0;--pink-dark:#e98bb5;--purple:#8d70c7;--ink:#46364f;--muted:#766b7c;--paper:#fffafd;--line:#f0dfeb;--shadow:0 12px 34px rgba(117,76,130,.10)}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(135deg,#fff5fa 0%,#f8f3ff 55%,#fff9f2 100%);color:var(--ink);font-family:'Quicksand',sans-serif;line-height:1.7}
a{color:inherit}.site-header{padding:22px 20px;border-bottom:1px solid rgba(233,139,181,.22);background:rgba(255,250,253,.82)}
.nav{max-width:1080px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{font:700 1.35rem 'Fredoka',sans-serif;text-decoration:none;color:var(--purple)}.nav a:not(.brand){font-weight:700;text-decoration:none}
main{max-width:1000px;margin:0 auto;padding:44px 22px 72px}.hero{text-align:center;padding:28px 12px 34px}.eyebrow{color:var(--purple);font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem}
h1,h2,h3{font-family:'Fredoka',sans-serif;line-height:1.2}h1{font-size:clamp(2.2rem,6vw,3.7rem);margin:12px 0;color:#5b4774}h2{font-size:1.8rem;margin:0 0 12px}.hero p{max-width:720px;margin:0 auto;color:var(--muted);font-size:1.08rem}
.intro,.faq,.explore{background:rgba(255,255,255,.82);border:1px solid var(--line);border-radius:22px;padding:26px;margin:22px 0;box-shadow:var(--shadow)}
.names-heading{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:34px 0 16px}.names-heading p{margin:0;color:var(--muted);font-size:.92rem}
.name-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.name-card{background:#fff;border:1px solid var(--line);border-radius:17px;padding:17px 18px;box-shadow:0 6px 18px rgba(117,76,130,.06)}.name-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.name-card h3{font-size:1.35rem;margin:0;color:#7257a5}.pronunciation{font-size:.75rem;color:#9a7bb4;white-space:nowrap}.meaning{margin:9px 0 2px;font-weight:700}.origin{margin:0;color:var(--muted);font-size:.88rem}
.faq details{padding:13px 0;border-bottom:1px solid var(--line)}.faq details:last-child{border:0}.faq summary{cursor:pointer;font-weight:700}.faq details p{margin:8px 0 0;color:var(--muted)}
.explore-links{display:flex;flex-wrap:wrap;gap:10px}.explore-links a{padding:8px 13px;border-radius:999px;background:#f8edf7;color:#73558e;text-decoration:none;font-weight:700;font-size:.9rem}
footer{text-align:center;padding:25px;color:var(--muted);font-size:.9rem;border-top:1px solid var(--line)}
@media(max-width:700px){.name-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.names-heading{display:block}.nav{flex-wrap:wrap}}@media(max-width:420px){.name-grid{grid-template-columns:1fr}.name-card{padding:15px}}
</style></head>
<body><header class="site-header"><nav class="nav"><a class="brand" href="/">Baby Name Generator ✿</a><a href="/">Name Generator</a></nav></header>
<main><section class="hero"><div class="eyebrow">Find a name to love</div><h1>${esc(category.title)}</h1><p>${esc(category.description)}</p></section>
<section class="intro"><h2>A thoughtful place to start</h2><p>${esc(category.intro)}</p></section>
<div class="names-heading"><h2>Names to explore</h2><p>${category.names.length} curated ideas · meanings · origins</p></div>
<section class="name-grid" aria-label="${esc(category.title)}">${cards}</section>
<section class="faq"><h2>Frequently asked questions</h2>${faqHtml}</section>
<section class="explore"><h2>Explore more name collections</h2><div class="explore-links">${data.categories.filter(c=>c.slug!==category.slug).map(c=>`<a href="/${esc(c.slug)}/">${esc(c.title)}</a>`).join('')}</div></section>
</main><footer>Made with care for growing families · <a href="/">Baby Name Generator</a></footer></body></html>`;
  const dir = path.join(root, category.slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),html);
  pages.push(url);
}
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',`  <url><loc>${origin}/</loc></url>`,...pages.map(u=>`  <url><loc>${u}</loc></url>`),'</urlset>'].join('\n');
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap+'\n');
console.log(`Generated ${pages.length} pSEO category pages and sitemap.xml`);

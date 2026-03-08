import { useState, useEffect, useRef, useCallback, useReducer, lazy, Suspense, createContext, useContext } from "react";

/*
  GHAR & GRACE — v3 Complete Frontend
  ─────────────────────────────────────
  · WebGL hero with cursor-reactive blobs + grain
  · 3-layer cursor: dot, lerp-ring, 8-dot comet trail
  · Cursor morphing via data-cursor attributes
  · Magnetic buttons with spring physics
  · Page transition curtain (panel slides in/out)
  · Scroll reveal: word-by-word headings, staggered cards, count-up stats
  · 33 products, multi-image, variants, reviews, low-stock
  · Full shop with dual-handle range slider + filter pills
  · Product page: lightbox, sticky purchase bar, provenance, complete the look
  · Journal page: drop cap, pull quotes, inline product cards
  · Gifting flow in checkout
  · CRM: real-structure data, animated charts, inline editing
  · Wishlist heart particle burst
  · Ambient sound toggle (Web Audio API)
  · Cart badge pulse, promo code animation
  · Scroll progress bar on detail pages
*/

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #F6F1E9;
  --warm: #FAF8F4;
  --sand: #E8E0D0;
  --taupe: #C4B8A4;
  --charcoal: #2A2A2A;
  --charcoal2: #444;
  --muted: #8A8478;
  --accent: #B8A898;
  --terracotta: #B5714A;
  --sage: #7A8C7A;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'DM Sans', sans-serif;
  --ease: cubic-bezier(.25,.46,.45,.94);
  --ease-out: cubic-bezier(.16,1,.3,1);
  --ease-in: cubic-bezier(.76,0,.24,1);
}

html { scroll-behavior: smooth; }
body {
  background: var(--warm);
  color: var(--charcoal);
  font-family: var(--sans);
  font-weight: 300;
  overflow-x: hidden;
  cursor: none;
}

/* ── SCROLL PROGRESS ── */
.scroll-progress {
  position: fixed; top: 0; left: 0; height: 1px;
  background: var(--taupe); z-index: 9999;
  transform-origin: left; transition: none;
  pointer-events: none;
}

/* ── CURSOR ── */
.cur-dot, .cur-ring {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
  will-change: transform;
}
.cur-dot {
  width: 6px; height: 6px;
  background: var(--charcoal);
  transition: opacity .2s, width .3s var(--ease), height .3s var(--ease), background .3s;
}
.cur-ring {
  width: 44px; height: 44px;
  border: 1px solid rgba(42,42,42,.5);
  transition: width .35s var(--ease), height .35s var(--ease), background .35s, border-color .35s;
  display: flex; align-items: center; justify-content: center;
}
.cur-ring.hover {
  width: 64px; height: 64px;
  background: rgba(196,184,164,.15);
  border-color: rgba(42,42,42,.3);
}
.cur-ring.image-hover {
  width: 96px; height: 96px;
  background: rgba(196,184,164,.1);
  animation: curRotate 4s linear infinite;
}
@keyframes curRotate { to { transform: translate(-50%,-50%) rotate(360deg); } }
.cur-ring-label {
  font-size: 9px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--charcoal); font-family: var(--sans); font-weight: 400;
  opacity: 0; transition: opacity .2s;
  position: absolute;
}
.cur-ring.hover .cur-ring-label, .cur-ring.image-hover .cur-ring-label { opacity: 1; }
.cur-dot.hover { opacity: 0; }
.cur-trail {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 9997;
  background: var(--taupe);
  transform: translate(-50%,-50%);
  will-change: transform;
}
.cur-ripple {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 9996;
  border: 1px solid var(--taupe);
  transform: translate(-50%,-50%) scale(0);
  animation: ripple .6s var(--ease-out) forwards;
}
@keyframes ripple {
  0%  { transform: translate(-50%,-50%) scale(0); opacity:1; }
  100%{ transform: translate(-50%,-50%) scale(3); opacity:0; }
}

/* ── PAGE TRANSITION ── */
.pt-curtain {
  position: fixed; inset: 0; z-index: 8000;
  background: var(--cream);
  transform: translateX(101%);
  pointer-events: none;
}
.pt-curtain.enter { animation: ptEnter .38s cubic-bezier(.76,0,.24,1) forwards; }
.pt-curtain.exit  { animation: ptExit  .38s cubic-bezier(.76,0,.24,1) forwards; }
@keyframes ptEnter { from{transform:translateX(101%)} to{transform:translateX(0)} }
@keyframes ptExit  { from{transform:translateX(0)}    to{transform:translateX(-101%)} }

.page-wrap { animation: pageReveal .5s var(--ease-out) forwards; }
@keyframes pageReveal {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── NAV ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  display: flex; align-items: center; justify-content: space-between;
  padding: 28px 64px;
  transition: all .4s var(--ease);
}
.nav.solid {
  background: rgba(250,248,244,.96);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--sand);
  padding: 18px 64px;
}
.logo {
  font-family: var(--serif); font-size: 21px; font-weight: 400;
  letter-spacing: .08em; cursor: pointer; user-select: none;
  font-feature-settings: "ss01" on, "liga" on;
}
.logo em { font-style: italic; color: var(--muted); }
.nav-links { display: flex; gap: 40px; list-style: none; }
.nav-links a {
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
  color: var(--charcoal2); cursor: pointer; transition: color .2s;
  position: relative; text-decoration: none;
}
.nav-links a::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 0; height: 1px; background: var(--charcoal);
  transition: width .3s var(--ease);
}
.nav-links a:hover::after, .nav-links a.active::after { width: 100%; }
.nav-right { display: flex; gap: 16px; align-items: center; }
.nav-icon {
  background: none; border: none; cursor: pointer;
  font-size: 17px; color: var(--charcoal2); transition: color .2s;
  position: relative; width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
}
.nav-icon:hover { color: var(--charcoal); }
.cart-badge {
  position: absolute; top: 0; right: 0;
  background: var(--charcoal); color: white; border-radius: 50%;
  width: 16px; height: 16px; font-size: 9px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--sans); font-weight: 400;
  transition: transform .3s var(--ease-out), box-shadow .3s;
}
.cart-badge.pulse {
  animation: badgePulse .35s var(--ease-out);
}
@keyframes badgePulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(196,184,164,0); }
  40%  { transform: scale(1.5); box-shadow: 0 0 0 4px rgba(196,184,164,.4); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(196,184,164,0); }
}

/* ── MAGNETIC BUTTON ── */
.mag-btn-wrap {
  display: inline-block;
  position: relative;
}

/* ── BUTTONS ── */
.btn-p {
  background: var(--charcoal); color: var(--warm); border: none;
  padding: 16px 40px; font-family: var(--sans); font-size: 11px;
  letter-spacing: .22em; text-transform: uppercase; cursor: pointer;
  position: relative; overflow: hidden; display: inline-block;
}
.btn-p::before {
  content: ''; position: absolute; inset: 0;
  background: var(--charcoal2); transform: translateX(-101%);
  transition: transform .38s var(--ease);
}
.btn-p:hover::before { transform: translateX(0); }
.btn-p span { position: relative; z-index: 1; }
.btn-g {
  background: none; border: none; font-family: var(--sans);
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
  color: var(--muted); cursor: pointer; display: inline-flex;
  align-items: center; gap: 10px; transition: all .3s;
}
.btn-g:hover { color: var(--charcoal); gap: 16px; }
.btn-l {
  background: var(--warm); color: var(--charcoal); border: none;
  padding: 16px 36px; font-family: var(--sans); font-size: 11px;
  letter-spacing: .22em; text-transform: uppercase; cursor: pointer;
  position: relative; overflow: hidden;
}
.btn-l::before {
  content: ''; position: absolute; inset: 0;
  background: var(--cream); transform: translateX(-101%);
  transition: transform .38s var(--ease);
}
.btn-l:hover::before { transform: translateX(0); }
.btn-l span { position: relative; z-index: 1; }

/* ── HERO ── */
.hero {
  min-height: 100vh; position: relative;
  display: grid; grid-template-columns: 1fr 1fr; overflow: hidden;
}
.hero-canvas-wrap {
  position: absolute; inset: 0; z-index: 0;
}
.hero-canvas { width: 100%; height: 100%; display: block; }
.hero-left {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; justify-content: center;
  padding: 120px 60px 80px 80px;
}
.hero-eyebrow {
  font-size: 10px; letter-spacing: .35em; text-transform: uppercase;
  color: var(--taupe); margin-bottom: 36px;
  opacity: 0; animation: fadeUp .8s .3s var(--ease) forwards;
}
.hero-h1 {
  font-family: var(--serif); font-weight: 300; line-height: 1.06;
  font-size: clamp(54px, 6.5vw, 88px); margin-bottom: 32px;
  font-feature-settings: "ss01" on, "liga" on;
  opacity: 0; animation: fadeUp .8s .5s var(--ease) forwards;
}
.hero-h1 em { font-style: italic; color: var(--muted); }
.hero-sub {
  font-size: 15px; line-height: 1.9; color: var(--charcoal2);
  max-width: 380px; margin-bottom: 60px;
  opacity: 0; animation: fadeUp .8s .7s var(--ease) forwards;
}
.hero-btns {
  display: flex; gap: 24px; align-items: center;
  opacity: 0; animation: fadeUp .8s .9s var(--ease) forwards;
}
.hero-right {
  position: relative; z-index: 1; overflow: hidden;
}
.hero-right-inner {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #E0D8CC, #CEC4B8);
}
.hero-float-card {
  position: absolute; bottom: 100px; left: -24px;
  background: var(--warm); padding: 28px 32px;
  box-shadow: 0 24px 80px rgba(42,42,42,.13);
  animation: floatCard 7s ease-in-out infinite;
  min-width: 200px;
}
@keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
.hero-float-title { font-family: var(--serif); font-size: 17px; margin-bottom: 4px; }
.hero-float-sub   { font-size: 11px; color: var(--muted); letter-spacing: .1em; }
.hero-float-price { font-size: 15px; margin-top: 14px; font-weight: 400; }
.hero-badge {
  position: absolute; top: 80px; right: 60px;
  width: 96px; height: 96px; border-radius: 50%;
  border: 1px solid rgba(42,42,42,.18);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-size: 10px; text-align: center;
  line-height: 1.55; color: var(--charcoal2);
  animation: badgeSpin 25s linear infinite;
}
@keyframes badgeSpin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

/* ── MARQUEE ── */
.marquee-outer {
  border-top: 1px solid var(--sand); border-bottom: 1px solid var(--sand);
  background: var(--cream); overflow: hidden; padding: 13px 0;
}
.marquee-track {
  display: flex; gap: 64px; width: max-content;
  animation: marqueeRun 32s linear infinite;
}
.marquee-outer:hover .marquee-track { animation-play-state: paused; }
@keyframes marqueeRun { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.marquee-item {
  font-size: 11px; letter-spacing: .25em; text-transform: uppercase;
  color: var(--taupe); white-space: nowrap; cursor: default;
  transition: transform .2s var(--ease);
}
.marquee-item:hover { transform: translateY(-2px); color: var(--muted); }
.marquee-em {
  font-family: var(--serif); font-style: italic;
  font-size: 14px; color: var(--muted);
}

/* ── SECTION REVEAL ── */
.reveal-word {
  display: inline-block; opacity: 0; transform: translateY(24px);
  transition: opacity .5s var(--ease-out), transform .5s var(--ease-out);
}
.reveal-word.visible { opacity: 1; transform: translateY(0); }
.reveal-card {
  opacity: 0; transform: translateY(32px);
  transition: opacity .6s var(--ease-out), transform .6s var(--ease-out);
}
.reveal-card.visible { opacity: 1; transform: translateY(0); }
.reveal-scale {
  opacity: 0; transform: scale(.94);
  transition: opacity .55s var(--ease-out), transform .55s var(--ease-out);
}
.reveal-scale.visible { opacity: 1; transform: scale(1); }
.reveal-fade {
  opacity: 0;
  transition: opacity .7s var(--ease-out);
}
.reveal-fade.visible { opacity: 1; }

/* ── PHILOSOPHY ── */
.philosophy {
  padding: 120px 80px; display: grid;
  grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  border-bottom: 1px solid var(--sand); position: relative;
}
.section-number {
  position: absolute; font-family: var(--serif);
  font-size: clamp(120px,15vw,200px); font-weight: 300;
  color: rgba(196,184,164,.07); line-height: 1; pointer-events: none;
  user-select: none; top: -.1em; left: -.03em;
}
.eyebrow {
  font-size: 10px; letter-spacing: .32em; text-transform: uppercase;
  color: var(--taupe); margin-bottom: 20px; display: block;
}
.phil-title {
  font-family: var(--serif); font-size: clamp(36px,4vw,54px);
  font-weight: 300; line-height: 1.18;
  font-feature-settings: "ss01" on, "liga" on;
}
.phil-title em { font-style: italic; }
.phil-p { font-size: 15px; line-height: 1.95; color: var(--charcoal2); margin-bottom: 20px; }

/* ── PRODUCTS SECTION ── */
.products-section { padding: 80px; }
.sec-hdr {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 64px; padding-bottom: 32px; border-bottom: 1px solid var(--sand);
}
.sec-title {
  font-family: var(--serif); font-size: clamp(30px,3.5vw,46px); font-weight: 300;
  font-feature-settings: "ss01" on, "liga" on;
}
.sec-link {
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
  color: var(--muted); cursor: pointer; transition: color .2s;
  display: flex; align-items: center; gap: 8px;
}
.sec-link:hover { color: var(--charcoal); }
.products-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; }

/* ── PRODUCT CARD ── */
.pcard {
  background: var(--cream); cursor: pointer;
  position: relative; overflow: hidden;
}
.pcard-img {
  aspect-ratio: 3/4; position: relative; overflow: hidden;
}
.pcard-img-layer {
  position: absolute; inset: 0;
  transition: opacity .5s var(--ease);
}
.pcard-img-layer.primary   { opacity: 1; }
.pcard-img-layer.secondary { opacity: 0; }
.pcard:hover .pcard-img-layer.primary   { opacity: 0; }
.pcard:hover .pcard-img-layer.secondary { opacity: 1; }
.pcard-lift {
  transition: transform .5s var(--ease), box-shadow .5s var(--ease);
}
.pcard:hover .pcard-lift {
  transform: translateY(-6px);
  box-shadow: 0 24px 60px rgba(42,42,42,.14);
}
.pcard-tag {
  position: absolute; top: 16px; left: 16px; z-index: 3;
  font-size: 9px; letter-spacing: .2em; text-transform: uppercase;
  background: var(--warm); padding: 5px 10px; color: var(--muted);
}
.low-stock-dot {
  position: absolute; top: 16px; right: 48px; z-index: 3;
  display: flex; align-items: center; gap: 5px;
  font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
  color: #B5714A; background: rgba(250,248,244,.9); padding: 4px 8px;
}
.low-stock-dot::before {
  content: ''; width: 5px; height: 5px; border-radius: 50%;
  background: #B5714A; flex-shrink: 0;
}
.sold-out-overlay {
  position: absolute; inset: 0; z-index: 4;
  background: rgba(250,248,244,.65);
  backdrop-filter: grayscale(1);
  display: flex; align-items: center; justify-content: center;
}
.sold-out-label {
  font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
  color: var(--muted); border: 1px solid var(--taupe); padding: 8px 16px;
}
.pcard-wish {
  position: absolute; top: 14px; right: 14px; z-index: 3;
  background: rgba(250,248,244,.85); border: none; width: 32px; height: 32px;
  border-radius: 50%; cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 14px; transition: all .3s;
  opacity: 0;
}
.pcard:hover .pcard-wish { opacity: 1; }
.pcard-wish.active { background: var(--charcoal); color: white; opacity: 1; }
.pcard-overlay {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(to top, rgba(42,42,42,.5) 0%, transparent 50%);
  opacity: 0; transition: opacity .4s var(--ease);
  display: flex; align-items: flex-end; padding: 20px;
}
.pcard:hover .pcard-overlay { opacity: 1; }
.pcard-quick {
  background: var(--warm); border: none; width: 100%; padding: 10px;
  font-family: var(--sans); font-size: 10px; letter-spacing: .18em;
  text-transform: uppercase; cursor: pointer; transition: all .3s;
}
.pcard-quick:hover { background: var(--charcoal); color: var(--warm); }
.pcard-info { padding: 20px 22px 28px; }
.pcard-name {
  font-family: var(--serif); font-size: 19px; font-weight: 400; margin-bottom: 4px;
  position: relative; display: inline-block;
}
.pcard-name::after {
  content: ''; position: absolute; bottom: -1px; left: 0;
  width: 0; height: 1px; background: var(--charcoal);
  transition: width .4s var(--ease);
}
.pcard:hover .pcard-name::after { width: 100%; }
.pcard-mat {
  font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--taupe); margin-bottom: 14px;
  transform: translateY(6px); opacity: .7;
  transition: transform .3s var(--ease), opacity .3s;
}
.pcard:hover .pcard-mat { transform: translateY(0); opacity: 1; }
.pcard-footer { display: flex; justify-content: space-between; align-items: center; }
.pcard-price { font-size: 15px; font-weight: 400; }
.price-sym {
  font-size: .65em; vertical-align: .2em;
  font-weight: 300; letter-spacing: 0;
}
.pcard-add {
  font-size: 10px; letter-spacing: .15em; text-transform: uppercase;
  background: none; border: 1px solid var(--sand); padding: 7px 14px;
  cursor: pointer; font-family: var(--sans); color: var(--charcoal2);
  position: relative; overflow: hidden; transition: color .3s, border-color .3s;
}
.pcard-add::before {
  content: ''; position: absolute;
  inset: 0; background: radial-gradient(circle at center, var(--charcoal) 0%, var(--charcoal) 100%);
  transform: scale(0); border-radius: 50%; transition: transform .5s var(--ease-out);
}
.pcard-add:hover { color: var(--warm); border-color: var(--charcoal); }
.pcard-add:hover::before { transform: scale(3); }
.pcard-add span { position: relative; z-index: 1; }

/* ── CATEGORIES ── */
.cats-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 2px; }
.cats-grid .cat-card:first-child { grid-column: span 2; }
.cat-card { position: relative; overflow: hidden; cursor: pointer; aspect-ratio: 1; }
.cat-card:first-child { aspect-ratio: auto; min-height: 320px; }
.cat-bg { position: absolute; inset: 0; transition: transform .65s var(--ease); }
.cat-card:hover .cat-bg { transform: scale(1.06); }
.cat-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(42,42,42,.62) 0%, transparent 60%);
}
.cat-lbl { position: absolute; bottom: 28px; left: 28px; color: white; }
.cat-lbl-sub { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; opacity: .65; margin-bottom: 5px; }
.cat-lbl-title { font-family: var(--serif); font-size: clamp(20px,2.5vw,30px); font-weight: 300; }

/* ── HOSPITALITY ── */
.hosp {
  background: linear-gradient(135deg, #2A2A2A, #3A3632);
  padding: 120px; display: grid; grid-template-columns: 1fr 1fr;
  gap: 100px; align-items: center;
}
.hosp-title {
  font-family: var(--serif); font-size: clamp(36px,4vw,56px);
  font-weight: 300; line-height: 1.15; color: var(--warm); margin-bottom: 24px;
}
.hosp-title em { font-style: italic; color: var(--taupe); }
.hosp-text { font-size: 14px; line-height: 1.95; color: rgba(250,248,244,.6); margin-bottom: 48px; }
.hosp-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.stat-n {
  font-family: var(--serif); font-size: 54px; font-weight: 300;
  color: var(--warm); line-height: 1; margin-bottom: 6px;
}
.stat-l { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--taupe); }

/* ── FOOTER ── */
.footer {
  padding: 80px; border-top: 1px solid var(--sand);
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px;
}
.footer-brand { font-family: var(--serif); font-size: 22px; margin-bottom: 14px; }
.footer-tagline { font-size: 13px; line-height: 1.8; color: var(--muted); max-width: 240px; }
.footer-col-title { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; margin-bottom: 20px; font-weight: 500; }
.footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-links a { font-size: 13px; color: var(--muted); cursor: pointer; transition: color .2s; }
.footer-links a:hover { color: var(--charcoal); }
.footer-bottom {
  grid-column: 1/-1; padding-top: 40px; border-top: 1px solid var(--sand);
  display: flex; justify-content: space-between; align-items: center;
}
.footer-copy { font-size: 11px; color: var(--taupe); }

/* ── SHOP ── */
.shop-hero {
  padding: 160px 80px 60px; border-bottom: 1px solid var(--sand);
  display: flex; justify-content: space-between; align-items: flex-end;
}
.shop-title { font-family: var(--serif); font-size: clamp(52px,7vw,96px); font-weight: 300; line-height: .95; }
.shop-layout { display: grid; grid-template-columns: 260px 1fr; }
.filters-panel {
  padding: 48px 32px; border-right: 1px solid var(--sand);
  position: sticky; top: 80px; height: calc(100vh - 80px); overflow-y: auto;
}
.fg-title { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; margin-bottom: 14px; font-weight: 500; }
.fg { margin-bottom: 36px; }
.fo {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  cursor: pointer; font-size: 13px; color: var(--charcoal2);
}
.fo input { accent-color: var(--charcoal); cursor: pointer; }
/* Dual range slider */
.range-wrap { position: relative; height: 20px; margin: 16px 0; }
.range-track {
  position: absolute; top: 50%; left: 0; right: 0; height: 2px;
  background: var(--sand); transform: translateY(-50%);
}
.range-fill {
  position: absolute; top: 50%; height: 2px;
  background: var(--charcoal); transform: translateY(-50%);
}
.range-thumb {
  position: absolute; top: 50%; width: 14px; height: 14px;
  background: var(--charcoal); border-radius: 50%;
  transform: translate(-50%, -50%); cursor: grab; z-index: 2;
}
.range-thumb:active { cursor: grabbing; }
.range-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }
/* Filter pills */
.filter-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.fpill {
  background: var(--charcoal); color: var(--warm); border: none;
  padding: 5px 12px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  font-family: var(--sans); transition: background .2s;
}
.fpill:hover { background: var(--charcoal2); }
.fpill-x { font-size: 12px; line-height: 1; }
.shop-grid-area { padding: 48px; }
.shop-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 28px;
}
.shop-count { font-size: 13px; color: var(--muted); }
.shop-sort {
  background: none; border: 1px solid var(--sand); padding: 8px 16px;
  font-family: var(--sans); font-size: 12px; color: var(--charcoal2); cursor: pointer;
}
.shop-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; }
.load-more-wrap { text-align: center; padding: 60px 0 0; }
/* Skeleton */
.skeleton {
  background: linear-gradient(90deg, var(--cream) 0%, var(--sand) 50%, var(--cream) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
.skel-card { aspect-ratio: 3/4; }
.skel-line { height: 14px; margin: 10px 0; border-radius: 2px; }

/* ── PRODUCT DETAIL ── */
.pd-page { padding-top: 80px; }
.pd-breadcrumb {
  padding: 18px 60px; font-size: 11px; color: var(--muted);
  letter-spacing: .1em; border-bottom: 1px solid var(--sand);
}
.pd-breadcrumb span { cursor: pointer; transition: color .2s; }
.pd-breadcrumb span:hover { color: var(--charcoal); }
.pd-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 85vh; }
.pd-gallery {
  padding: 32px; display: grid; grid-template-columns: 72px 1fr; gap: 12px;
  position: sticky; top: 80px; height: calc(100vh - 80px); align-content: start;
}
.pd-thumbs { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
.pd-thumb { aspect-ratio: 3/4; cursor: pointer; border: 2px solid transparent; transition: border-color .2s; overflow: hidden; }
.pd-thumb.active { border-color: var(--charcoal); }
.pd-main-wrap { position: relative; aspect-ratio: 3/4; overflow: hidden; cursor: zoom-in; }
.pd-main-img { width: 100%; height: 100%; transition: opacity .35s var(--ease); }
.pd-img-nav {
  position: absolute; bottom: 18px; right: 18px;
  display: flex; gap: 8px; z-index: 2;
}
.pd-nav-btn {
  background: rgba(250,248,244,.88); border: none;
  width: 36px; height: 36px; cursor: pointer; font-size: 15px; transition: all .2s;
}
.pd-nav-btn:hover { background: var(--warm); }
.pd-img-count {
  position: absolute; bottom: 18px; left: 18px; z-index: 2;
  font-size: 10px; letter-spacing: .15em; color: var(--muted);
  background: rgba(250,248,244,.8); padding: 5px 10px;
}
/* Floating wish/share */
.pd-float-actions {
  position: fixed; top: 130px; right: 32px; z-index: 300;
  display: flex; flex-direction: column; gap: 10px;
}
.pd-float-btn {
  width: 52px; height: 52px; border-radius: 50%;
  border: 1px solid var(--sand); background: var(--warm); cursor: pointer;
  font-size: 20px; display: flex; align-items: center; justify-content: center;
  transition: all .3s var(--ease);
  box-shadow: 0 4px 20px rgba(42,42,42,.08);
}
.pd-float-btn:hover { transform: scale(1.1); box-shadow: 0 8px 30px rgba(42,42,42,.14); }
.pd-float-btn.active { background: var(--charcoal); border-color: var(--charcoal); color: white; }
/* Wish particle */
.wish-particle {
  position: fixed; pointer-events: none; z-index: 9995;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--taupe); animation: wishParticle .45s var(--ease-out) forwards;
}
@keyframes wishParticle {
  0%  { transform: translate(-50%,-50%) translate(0,0); opacity: 1; }
  100%{ transform: translate(-50%,-50%) translate(var(--tx),var(--ty)); opacity: 0; }
}
/* Lightbox */
.lightbox {
  position: fixed; inset: 0; z-index: 7000;
  background: rgba(42,42,42,.95); display: flex; align-items: center;
  justify-content: center; opacity: 0; animation: lbIn .3s var(--ease) forwards;
}
@keyframes lbIn { to{opacity:1} }
.lightbox-img { max-width: 80vw; max-height: 90vh; }
.lightbox-close {
  position: absolute; top: 32px; right: 32px;
  background: none; border: none; color: white; font-size: 28px; cursor: pointer;
}
.lightbox-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(250,248,244,.1); border: none; color: white; font-size: 24px;
  cursor: pointer; padding: 20px 14px; transition: background .2s;
}
.lightbox-nav:hover { background: rgba(250,248,244,.2); }
.lightbox-nav.prev { left: 32px; }
.lightbox-nav.next { right: 32px; }

.pd-info { padding: 60px 80px 60px 48px; display: flex; flex-direction: column; }
.pd-cat { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--taupe); margin-bottom: 16px; }
.pd-title {
  font-family: var(--serif); font-size: clamp(36px,4vw,52px); font-weight: 300;
  line-height: 1.1; margin-bottom: 10px;
  font-feature-settings: "ss01" on, "liga" on;
}
.pd-sub { font-size: 13px; color: var(--muted); font-style: italic; margin-bottom: 20px; }
.pd-price { font-size: 26px; font-weight: 400; margin-bottom: 6px; }
.pd-tax { font-size: 11px; color: var(--muted); margin-bottom: 30px; }
.pd-desc { font-size: 14px; line-height: 1.95; color: var(--charcoal2); margin-bottom: 36px; max-width: 440px; }
.pd-specs { border-top: 1px solid var(--sand); border-bottom: 1px solid var(--sand); padding: 28px 0; margin-bottom: 36px; }
.pd-spec { display: grid; grid-template-columns: 130px 1fr; gap: 12px; margin-bottom: 12px; }
.pd-spec-lbl { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--taupe); padding-top: 2px; }
.pd-spec-val { font-size: 13px; color: var(--charcoal2); line-height: 1.7; }
.pd-qty { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.pd-qty-lbl { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.qty-ctrl { display: flex; align-items: center; border: 1px solid var(--sand); }
.qty-btn {
  background: none; border: none; width: 36px; height: 36px;
  cursor: pointer; font-size: 18px; color: var(--charcoal2);
  transition: all .2s; display: flex; align-items: center; justify-content: center;
}
.qty-btn:hover { background: var(--cream); }
.qty-n {
  width: 40px; text-align: center; font-size: 14px;
  border-left: 1px solid var(--sand); border-right: 1px solid var(--sand);
  height: 36px; display: flex; align-items: center; justify-content: center;
  transition: transform .2s, color .15s;
}
.qty-n.pulse { animation: qtyPulse .25s var(--ease); }
@keyframes qtyPulse { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
.pd-actions { display: flex; gap: 12px; margin-bottom: 24px; }
.pd-add-btn {
  flex: 1; background: var(--charcoal); color: var(--warm);
  border: none; padding: 18px; font-family: var(--sans);
  font-size: 11px; letter-spacing: .22em; text-transform: uppercase;
  cursor: pointer; position: relative; overflow: hidden; transition: background .3s;
}
.pd-add-btn.adding { background: #5A7A6A; }
.pd-add-btn.adding::after {
  content: 'Added ✓'; position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; letter-spacing: .22em;
}
.pd-buy-btn {
  flex: 1; background: none; border: 1px solid var(--charcoal);
  color: var(--charcoal); padding: 18px; font-family: var(--sans);
  font-size: 11px; letter-spacing: .22em; text-transform: uppercase;
  cursor: pointer; transition: all .35s;
}
.pd-buy-btn:hover { background: var(--charcoal); color: var(--warm); }
.pd-ship-info {
  background: var(--cream); padding: 18px 22px;
  font-size: 12px; color: var(--muted); line-height: 1.8; margin-bottom: 20px;
}
.pd-ship-row { display: flex; gap: 10px; margin-bottom: 5px; }
.pd-trust { display: flex; gap: 20px; flex-wrap: wrap; }
.pd-trust-item {
  font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
  color: var(--taupe); display: flex; gap: 5px; align-items: center;
}
/* Sticky bar */
.sticky-purchase {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 400;
  background: rgba(250,248,244,.97); backdrop-filter: blur(16px);
  border-top: 1px solid var(--sand);
  padding: 14px 80px; display: flex; align-items: center;
  justify-content: space-between;
  transform: translateY(100%); transition: transform .4s var(--ease-out);
}
.sticky-purchase.visible { transform: translateY(0); }
.sticky-prod-name { font-family: var(--serif); font-size: 20px; font-weight: 300; }
.sticky-prod-price { font-size: 16px; font-weight: 400; margin-left: 20px; }
.sticky-add {
  background: var(--charcoal); color: var(--warm); border: none;
  padding: 14px 32px; font-family: var(--sans); font-size: 11px;
  letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: background .3s;
}
.sticky-add:hover { background: var(--charcoal2); }

/* Reviews */
.reviews-section { padding: 60px 80px; border-top: 1px solid var(--sand); }
.stars { display: flex; gap: 3px; align-items: center; }
.star-svg { width: 14px; height: 14px; }
.review-card {
  padding: 24px 0; border-bottom: 1px solid var(--sand);
  display: grid; grid-template-columns: 120px 1fr; gap: 24px;
}
.review-author { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
.review-date { font-size: 11px; color: var(--taupe); }
.review-verified { font-size: 10px; color: var(--sage); letter-spacing: .1em; text-transform: uppercase; margin-top: 6px; }
.review-body { font-size: 14px; line-height: 1.85; color: var(--charcoal2); margin-top: 8px; }
.review-form textarea {
  width: 100%; border: none; border-bottom: 1px solid var(--sand);
  padding: 12px 0; font-family: var(--sans); font-size: 14px;
  resize: none; outline: none; background: none; color: var(--charcoal);
  transition: border-color .2s; min-height: 100px;
}
.review-form textarea:focus { border-color: var(--charcoal); }
.char-count { font-size: 11px; color: var(--taupe); text-align: right; margin-top: 6px; }

/* Provenance */
.provenance {
  padding: 60px 80px; border-top: 1px solid var(--sand);
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
}
.prov-block-title { font-family: var(--serif); font-size: 26px; font-weight: 300; margin-bottom: 16px; }
.prov-text { font-size: 14px; line-height: 1.9; color: var(--charcoal2); }

/* Complete the look */
.ctl-section { padding: 60px 80px; border-top: 1px solid var(--sand); }
.ctl-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 40px; }

/* ── CART DRAWER ── */
.cart-overlay {
  position: fixed; inset: 0; background: rgba(42,42,42,.4); z-index: 600;
  opacity: 0; pointer-events: none; transition: opacity .35s;
}
.cart-overlay.open { opacity: 1; pointer-events: all; }
.cart-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: 440px;
  background: var(--warm); z-index: 601;
  transform: translateX(100%); transition: transform .45s var(--ease);
  display: flex; flex-direction: column;
  box-shadow: -20px 0 60px rgba(42,42,42,.12);
}
.cart-drawer.open { transform: translateX(0); }
.cart-hdr {
  padding: 28px 36px; display: flex; justify-content: space-between;
  align-items: center; border-bottom: 1px solid var(--sand);
}
.cart-hdr-title { font-family: var(--serif); font-size: 24px; font-weight: 300; }
.cart-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--muted); transition: color .2s; }
.cart-close:hover { color: var(--charcoal); }
.cart-items { flex: 1; overflow-y: auto; padding: 28px 36px; }
.cart-item {
  display: grid; grid-template-columns: 76px 1fr; gap: 16px;
  margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--sand);
}
.cart-item-img { width: 76px; height: 96px; overflow: hidden; }
.cart-item-name { font-family: var(--serif); font-size: 17px; margin-bottom: 4px; }
.cart-item-meta { font-size: 11px; color: var(--muted); margin-bottom: 10px; }
.cart-item-row { display: flex; justify-content: space-between; align-items: center; }
.cart-item-price { font-size: 14px; font-weight: 400; }
.cart-item-remove { background: none; border: none; color: var(--taupe); cursor: pointer; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; transition: color .2s; }
.cart-item-remove:hover { color: var(--charcoal); }
.cart-footer { padding: 24px 36px; border-top: 1px solid var(--sand); }
.promo-wrap { display: flex; gap: 0; margin-bottom: 18px; }
.promo-input {
  flex: 1; border: 1px solid var(--sand); border-right: none;
  padding: 10px 16px; font-family: var(--sans); font-size: 12px;
  background: none; outline: none; transition: border-color .2s, background .3s;
}
.promo-input:focus { border-color: var(--charcoal); }
.promo-input.valid { border-color: var(--sage); background: rgba(122,140,122,.05); }
.promo-btn {
  background: var(--charcoal); color: var(--warm); border: none;
  padding: 10px 20px; font-size: 11px; letter-spacing: .15em;
  text-transform: uppercase; cursor: pointer; font-family: var(--sans); transition: background .2s;
}
.promo-btn:hover { background: var(--charcoal2); }
.promo-success {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--sage); margin-bottom: 14px;
  animation: slideDown .3s var(--ease-out);
}
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.promo-check { display: inline-block; animation: drawCheck .4s var(--ease-out); }
@keyframes drawCheck { from{stroke-dashoffset:20} to{stroke-dashoffset:0} }
.cart-totals { margin-bottom: 16px; }
.cart-total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 8px; }
.cart-grand-row { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--sand); margin-bottom: 20px; }
.cart-grand-lbl { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; }
.cart-grand-val { font-family: var(--serif); font-size: 22px; font-weight: 300; }
.discount-line {
  display: flex; justify-content: space-between; font-size: 13px;
  color: var(--sage); margin-bottom: 8px;
  animation: slideDown .3s var(--ease-out);
}
.cart-checkout-btn {
  width: 100%; background: var(--charcoal); color: var(--warm);
  border: none; padding: 18px; font-family: var(--sans); font-size: 11px;
  letter-spacing: .22em; text-transform: uppercase; cursor: pointer;
  transition: background .35s; margin-bottom: 10px;
}
.cart-checkout-btn:hover { background: var(--charcoal2); }
.cart-continue {
  width: 100%; background: none; border: 1px solid var(--sand);
  padding: 13px; font-family: var(--sans); font-size: 11px; letter-spacing: .18em;
  text-transform: uppercase; cursor: pointer; color: var(--charcoal2); transition: border-color .2s;
}
.cart-continue:hover { border-color: var(--charcoal); }
.cart-empty { text-align: center; padding: 80px 0; }
.cart-empty-icon { font-size: 40px; margin-bottom: 16px; opacity: .3; }
.cart-empty-t { font-family: var(--serif); font-size: 22px; color: var(--muted); margin-bottom: 8px; }
.cart-empty-s { font-size: 13px; color: var(--taupe); }

/* ── PAYMENT ── */
.payment-wrap { padding-top: 100px; min-height: 100vh; }
.payment-layout {
  display: grid; grid-template-columns: 1fr 420px; gap: 0;
  max-width: 1100px; margin: 0 auto; padding: 0 60px;
}
.payment-left { padding-right: 60px; border-right: 1px solid var(--sand); }
.payment-right { padding-left: 60px; }
.payment-title { font-family: var(--serif); font-size: 42px; font-weight: 300; margin-bottom: 48px; }
.fsec-title {
  font-size: 10px; letter-spacing: .28em; text-transform: uppercase;
  margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--sand);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-row.full { grid-template-columns: 1fr; }
.form-g { display: flex; flex-direction: column; gap: 6px; }
.form-lbl { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.form-inp {
  border: none; border-bottom: 1px solid var(--sand); padding: 10px 0;
  font-family: var(--sans); font-size: 14px; background: none; outline: none;
  color: var(--charcoal); transition: border-color .2s;
}
.form-inp:focus { border-color: var(--charcoal); }
.form-inp::placeholder { color: var(--taupe); transition: opacity .2s; }
.form-inp:not(:placeholder-shown)::placeholder { opacity: 0; }
.pay-methods { display: flex; gap: 10px; margin-bottom: 24px; }
.pay-method-btn {
  flex: 1; border: 1px solid var(--sand); padding: 12px 8px; cursor: pointer;
  background: none; font-family: var(--sans); font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--charcoal2); transition: all .3s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.pay-method-btn.active { border-color: var(--charcoal); background: var(--charcoal); color: var(--warm); }
.payment-submit {
  width: 100%; background: var(--charcoal); color: var(--warm); border: none;
  padding: 20px; font-family: var(--sans); font-size: 12px;
  letter-spacing: .22em; text-transform: uppercase; cursor: pointer;
  transition: background .3s; margin-top: 32px;
}
.payment-submit:hover { background: var(--charcoal2); }
.order-sum-title { font-family: var(--serif); font-size: 24px; font-weight: 300; margin-bottom: 28px; }
.order-item {
  display: flex; gap: 16px; margin-bottom: 20px;
  padding-bottom: 20px; border-bottom: 1px solid var(--sand);
}
.order-item-img { width: 64px; height: 80px; flex-shrink: 0; overflow: hidden; }
.order-item-name { font-family: var(--serif); font-size: 16px; margin-bottom: 4px; }
.order-item-meta { font-size: 11px; color: var(--muted); }
.order-item-price { font-size: 14px; margin-left: auto; padding-top: 2px; white-space: nowrap; }
.order-totals { margin-top: 20px; }
.order-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 10px; }
.order-grand {
  display: flex; justify-content: space-between; padding-top: 16px;
  border-top: 1px solid var(--sand); margin-top: 8px;
}
.order-grand-lbl { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; }
.order-grand-val { font-family: var(--serif); font-size: 22px; font-weight: 300; }
.secure-note { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--taupe); margin-top: 20px; }
/* Gift flow */
.gift-toggle-wrap {
  padding: 20px; background: var(--cream); margin-bottom: 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.gift-toggle-lbl { font-size: 13px; color: var(--charcoal); }
.toggle-switch { position: relative; width: 40px; height: 22px; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-track {
  position: absolute; inset: 0; background: var(--sand);
  border-radius: 11px; transition: background .3s;
}
.toggle-switch input:checked + .toggle-track { background: var(--charcoal); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; background: white; border-radius: 50%;
  transition: transform .3s var(--ease);
}
.toggle-switch input:checked ~ .toggle-thumb { transform: translateX(18px); }
.gift-options {
  padding: 20px; background: var(--cream); margin-bottom: 24px;
  animation: slideDown .3s var(--ease-out);
}
/* Order success */
.order-success {
  min-height: 100vh; display: flex; align-items: center;
  justify-content: center; text-align: center; padding: 80px;
}
.success-icon { font-size: 60px; margin-bottom: 24px; animation: successBounce .6s var(--ease-out); }
@keyframes successBounce { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
.success-title { font-family: var(--serif); font-size: 52px; font-weight: 300; margin-bottom: 16px; }
.success-sub { font-size: 15px; color: var(--muted); margin-bottom: 48px; line-height: 1.8; max-width: 480px; }
.success-order { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--taupe); margin-bottom: 40px; }

/* ── JOURNAL ── */
.journal-hero {
  padding: 160px 80px 80px; border-bottom: 1px solid var(--sand);
}
.journal-hero-title { font-family: var(--serif); font-size: clamp(52px,7vw,88px); font-weight: 300; margin-bottom: 16px; }
.journal-grid { padding: 80px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; }
.journal-hero-card { grid-column: span 2; }
.journal-card { background: var(--cream); cursor: pointer; overflow: hidden; }
.journal-card-img { aspect-ratio: 16/9; overflow: hidden; }
.journal-card.hero-card .journal-card-img { aspect-ratio: 4/3; }
.journal-card-img-inner { width: 100%; height: 100%; transition: transform .7s var(--ease); }
.journal-card:hover .journal-card-img-inner { transform: scale(1.04); }
.journal-card-info { padding: 28px 32px 36px; }
.journal-card-cat { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--taupe); margin-bottom: 12px; }
.journal-card-title {
  font-family: var(--serif); font-size: clamp(22px,2.5vw,30px); font-weight: 300;
  margin-bottom: 10px; position: relative; display: inline-block;
}
.journal-card-title::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 0; height: 1px; background: var(--charcoal);
  transition: width .4s var(--ease);
}
.journal-card:hover .journal-card-title::after { width: 100%; }
.journal-card-sub { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 16px; }
.journal-card-meta { font-size: 11px; color: var(--taupe); letter-spacing: .08em; }

/* Article page */
.article-progress { position: fixed; top: 0; left: 0; height: 2px; background: var(--taupe); z-index: 9999; transform-origin: left; }
.article-sticky-hdr {
  position: fixed; top: 80px; left: 0; right: 0; z-index: 200;
  background: rgba(250,248,244,.95); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--sand); padding: 10px 80px;
  display: flex; align-items: center; justify-content: space-between;
  transform: translateY(-100%); transition: transform .3s var(--ease);
}
.article-sticky-hdr.visible { transform: translateY(0); }
.article-sticky-title { font-family: var(--serif); font-size: 18px; font-weight: 300; }
.article-sticky-read { font-size: 11px; color: var(--taupe); letter-spacing: .1em; }
.article-hero { padding: 160px 80px 60px; max-width: 1000px; }
.article-hero-title { font-family: var(--serif); font-size: clamp(48px,6.5vw,80px); font-weight: 300; line-height: 1.06; margin-bottom: 20px; }
.article-hero-sub { font-size: 17px; color: var(--muted); line-height: 1.7; max-width: 600px; margin-bottom: 32px; }
.article-hero-meta { font-size: 11px; color: var(--taupe); letter-spacing: .12em; }
.article-body { max-width: 680px; margin: 0 auto; padding: 60px 80px 120px; }
.journal-body p { font-size: 16px; line-height: 1.95; color: var(--charcoal2); margin-bottom: 28px; }
.journal-body p:first-of-type::first-letter {
  font-family: var(--serif); font-size: 5.2em; font-weight: 300;
  float: left; line-height: .75; margin: .08em .12em 0 0; color: var(--charcoal);
}
.pull-quote {
  font-family: var(--serif); font-size: clamp(24px,3vw,34px); font-weight: 300;
  font-style: italic; line-height: 1.35; color: var(--charcoal);
  padding: 40px 0; border-top: 1px solid var(--sand); border-bottom: 1px solid var(--sand);
  margin: 48px 0; text-align: center;
}
.inline-product-card {
  display: flex; gap: 20px; align-items: center; background: var(--cream);
  padding: 20px 24px; margin: 36px 0; cursor: pointer; transition: all .3s;
}
.inline-product-card:hover { box-shadow: 0 8px 32px rgba(42,42,42,.08); }
.inline-product-img { width: 64px; height: 80px; flex-shrink: 0; overflow: hidden; }
.inline-product-name { font-family: var(--serif); font-size: 18px; font-weight: 400; margin-bottom: 4px; }
.inline-product-meta { font-size: 11px; color: var(--muted); margin-bottom: 10px; }
.inline-product-price { font-size: 14px; margin-right: auto; }
.inline-add {
  background: var(--charcoal); color: var(--warm); border: none;
  padding: 8px 20px; font-family: var(--sans); font-size: 10px;
  letter-spacing: .18em; text-transform: uppercase; cursor: pointer; transition: background .2s;
}
.inline-add:hover { background: var(--charcoal2); }

/* ── ABOUT ── */
.about-hero { padding: 200px 100px 100px; max-width: 1000px; }
.about-h1 { font-family: var(--serif); font-size: clamp(60px,8vw,108px); font-weight: 300; line-height: 1.0; }
.about-h1 em { font-style: italic; }
.about-split {
  padding: 80px 100px 120px; display: grid;
  grid-template-columns: 1fr 1fr; gap: 120px; border-top: 1px solid var(--sand);
}
.about-block-h { font-family: var(--serif); font-size: 36px; font-weight: 300; margin-bottom: 24px; }
.about-block-p { font-size: 15px; line-height: 1.95; color: var(--charcoal2); }
.about-block-p p { margin-bottom: 20px; }
.about-principles { padding: 0 100px 120px; display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; }
.principle { background: var(--cream); padding: 52px 40px; }
.principle-n { font-family: var(--serif); font-size: 56px; font-weight: 300; color: var(--sand); margin-bottom: 16px; }
.principle-h { font-family: var(--serif); font-size: 22px; margin-bottom: 14px; }
.principle-p { font-size: 13px; line-height: 1.8; color: var(--muted); }

/* ── WISHLIST ── */
.wish-hero { padding: 160px 80px 60px; border-bottom: 1px solid var(--sand); }
.wish-title { font-family: var(--serif); font-size: clamp(52px,7vw,88px); font-weight: 300; }

/* ── CRM ── */
.crm-wrap { display: grid; grid-template-columns: 240px 1fr; height: 100vh; overflow: hidden; background: #F4F2EF; }
.crm-sidebar { background: #2A2A2A; display: flex; flex-direction: column; overflow-y: auto; }
.crm-logo { padding: 28px; border-bottom: 1px solid rgba(255,255,255,.08); }
.crm-logo-name { font-family: var(--serif); font-size: 18px; color: var(--warm); }
.crm-logo-name em { font-style: italic; color: var(--taupe); }
.crm-logo-sub { font-size: 9px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
.crm-nav { padding: 16px 0; flex: 1; }
.crm-nav-grp { font-size: 9px; letter-spacing: .25em; text-transform: uppercase; color: rgba(255,255,255,.22); padding: 16px 28px 8px; }
.crm-nav-item {
  display: flex; align-items: center; gap: 12px; padding: 11px 28px;
  cursor: pointer; transition: all .2s; font-size: 13px;
  color: rgba(255,255,255,.5); border-left: 2px solid transparent;
}
.crm-nav-item:hover { color: rgba(255,255,255,.8); background: rgba(255,255,255,.04); }
.crm-nav-item.active { color: var(--warm); background: rgba(255,255,255,.07); border-left-color: var(--taupe); }
.crm-main { overflow-y: auto; height: 100vh; }
.crm-topbar {
  background: white; padding: 20px 36px; border-bottom: 1px solid #E8E4DF;
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; top: 0; z-index: 10;
}
.crm-page-title { font-family: var(--serif); font-size: 26px; font-weight: 300; }
.crm-search {
  border: 1px solid #E8E4DF; padding: 8px 16px;
  font-family: var(--sans); font-size: 12px; background: none;
  outline: none; width: 220px; transition: border-color .2s;
}
.crm-search:focus { border-color: var(--charcoal); }
.crm-body { padding: 28px 36px; }
.crm-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
.crm-card { background: white; padding: 24px 28px; border: 1px solid #E8E4DF; }
.crm-card-lbl { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
.crm-card-val { font-family: var(--serif); font-size: 36px; font-weight: 300; margin-bottom: 6px; line-height: 1; }
.crm-card-chg { font-size: 11px; display: flex; align-items: center; gap: 4px; }
.crm-card-chg.up { color: #5A8C6A; }
.crm-card-chg.dn { color: #8C5A5A; }
.crm-two-col { display: grid; grid-template-columns: 1fr 360px; gap: 16px; margin-bottom: 28px; }
.crm-panel { background: white; border: 1px solid #E8E4DF; padding: 24px; }
.crm-panel-title {
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
  margin-bottom: 20px; font-weight: 500; padding-bottom: 14px; border-bottom: 1px solid #E8E4DF;
}
.crm-table { width: 100%; border-collapse: collapse; }
.crm-table th {
  font-size: 9px; letter-spacing: .22em; text-transform: uppercase;
  color: var(--muted); text-align: left; padding: 0 12px 12px; border-bottom: 1px solid #E8E4DF;
}
.crm-table td { padding: 14px 12px; border-bottom: 1px solid #F4F2EF; font-size: 13px; vertical-align: middle; cursor: pointer; }
.crm-table tr:last-child td { border-bottom: none; }
.crm-table tr:hover td { background: #FAFAF8; }
.crm-status {
  font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 2px;
}
.crm-status.paid      { background: #EBF4EE; color: #3D7A4E; }
.crm-status.pending   { background: #FDF4E7; color: #8A6A2A; }
.crm-status.shipped   { background: #E8EEF8; color: #2A4A8A; }
.crm-status.cancelled { background: #F8ECEC; color: #8A2A2A; }
.crm-status.confirmed { background: #F0EAF8; color: #5A2A8A; }
/* CRM chart */
.crm-chart { display: flex; align-items: flex-end; gap: 8px; height: 160px; padding-bottom: 8px; }
.crm-bar-grp { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.crm-bar {
  width: 100%; background: linear-gradient(to top, var(--taupe), var(--sand));
  min-height: 4px; transform-origin: bottom; transform: scaleY(0);
  animation: barGrow .8s var(--ease-out) forwards;
}
@keyframes barGrow { to{transform:scaleY(1)} }
.crm-bar-lbl { font-size: 9px; color: var(--muted); letter-spacing: .08em; }
/* Inline edit */
.crm-inline-edit {
  background: none; border: none; border-bottom: 1px solid var(--sand);
  font-family: var(--sans); font-size: 13px; color: var(--charcoal);
  width: 60px; outline: none; padding: 2px 4px;
}
.crm-inline-edit:focus { border-color: var(--charcoal); }
/* Status badge */
.crm-tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid #E8E4DF; }
.crm-tab {
  padding: 10px 20px; cursor: pointer; font-size: 11px; letter-spacing: .15em;
  text-transform: uppercase; color: var(--muted); border-bottom: 2px solid transparent; transition: all .2s;
}
.crm-tab.active { color: var(--charcoal); border-bottom-color: var(--charcoal); }
.crm-badge {
  background: var(--charcoal); color: white; font-size: 9px;
  padding: 2px 6px; border-radius: 10px; margin-left: 6px;
}
/* Inventory */
.crm-inv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
.crm-inv-card { background: white; border: 1px solid #E8E4DF; padding: 20px; }
.crm-inv-sku { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: var(--taupe); margin-bottom: 6px; }
.crm-inv-name { font-family: var(--serif); font-size: 15px; margin-bottom: 8px; }
.crm-inv-bar { height: 3px; background: #E8E4DF; margin-bottom: 8px; }
.crm-inv-fill { height: 100%; border-radius: 2px; }
.crm-inv-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 36px; right: 36px;
  background: var(--charcoal); color: var(--warm);
  padding: 16px 24px; font-size: 12px; letter-spacing: .05em;
  z-index: 8999; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 8px 40px rgba(42,42,42,.25);
  transform: translateY(16px); opacity: 0; pointer-events: none;
  transition: all .4s var(--ease-out);
}
.toast.show { transform: translateY(0); opacity: 1; }

/* ── AMBIENT SOUND ── */
.sound-toggle {
  position: fixed; bottom: 100px; right: 36px; z-index: 400;
  width: 36px; height: 36px; background: none; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: .5; transition: opacity .2s;
}
.sound-toggle:hover { opacity: 1; }
.sound-bar {
  width: 3px; background: var(--taupe); border-radius: 2px; margin: 0 1.5px;
}
.sound-toggle.active .sound-bar-1 { animation: soundPulse 1.2s ease-in-out infinite; }
.sound-toggle.active .sound-bar-2 { animation: soundPulse 1.2s ease-in-out .3s infinite; }
.sound-toggle.active .sound-bar-3 { animation: soundPulse 1.2s ease-in-out .6s infinite; }
@keyframes soundPulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.8)} }

/* ── RESPONSIVE ── */
@media(max-width:1200px) {
  .crm-cards{grid-template-columns:repeat(2,1fr)}
  .crm-two-col{grid-template-columns:1fr}
  .crm-inv-grid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:1024px){
  .nav{padding:22px 32px}
  .nav.solid{padding:16px 32px}
  .hero{grid-template-columns:1fr}
  .hero-right{height:70vw}
  .philosophy{padding:60px;grid-template-columns:1fr}
  .products-grid{grid-template-columns:repeat(2,1fr)}
  .cats-grid{grid-template-columns:repeat(2,1fr)}
  .cats-grid .cat-card:first-child{grid-column:span 1;aspect-ratio:1}
  .hosp{padding:60px;grid-template-columns:1fr}
  .footer{grid-template-columns:1fr 1fr}
  .shop-layout{grid-template-columns:1fr}
  .filters-panel{display:none}
  .shop-grid{grid-template-columns:repeat(2,1fr)}
  .pd-layout{grid-template-columns:1fr}
  .pd-gallery{position:relative;top:0;height:auto}
  .pd-float-actions{top:100px;right:16px}
  .payment-layout{grid-template-columns:1fr;padding:0 32px}
  .payment-right{padding-left:0;border-top:1px solid var(--sand);padding-top:40px;margin-top:20px}
  .payment-left{border-right:none;padding-right:0}
  .about-hero{padding:140px 60px 80px}
  .about-split{padding:60px;grid-template-columns:1fr}
  .about-principles{padding:0 60px 80px}
  .journal-grid{grid-template-columns:1fr;padding:40px}
  .journal-hero-card{grid-column:span 1}
  .article-body{padding:40px}
  .sticky-purchase{padding:14px 32px}
}
@media(max-width:640px){
  .nav-links{display:none}
  .products-grid,.shop-grid{grid-template-columns:1fr}
  .cats-grid{grid-template-columns:1fr}
  .hero-left{padding:100px 28px 60px}
  .products-section{padding:40px 24px}
  .hosp{padding:40px 28px}
  .footer{grid-template-columns:1fr;padding:48px 28px}
  .crm-wrap{grid-template-columns:1fr}
  .crm-sidebar{display:none}
  .crm-inv-grid{grid-template-columns:1fr}
  .crm-cards{grid-template-columns:1fr 1fr}
  .about-hero{padding:120px 28px 60px}
  .about-split,.about-principles{padding:40px 28px 60px;grid-template-columns:1fr}
}
`;

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════
const CATS = ["Wall Art","Table Decor","Sculptures","Vessels","Textiles"];

function mk(c1,c2,c3,n,t){ return Array.from({length:n},(_,i)=>({c1:[c1,c2,c3][i%3],c2:[c2,c3,c1][i%3],t:(t+i)%9})); }

const P = [
  {id:1,name:"Vessel No. 7",sub:"Stoneware Collection",mat:"Stoneware",finish:"Unglazed natural",dims:"H 28 × Ø 14 cm",care:"Wipe with dry cloth",ship:"7–10 days",cat:"Vessels",price:4200,tag:"New",stock:14,imgs:mk("#D4C4B0","#C4B4A0","#E0D4C4",6,0),maker:"Studio Mrida",origin:"Jaipur, Rajasthan"},
  {id:2,name:"Ripple Panel",sub:"Wall Study Series",mat:"Cast Concrete",finish:"Micro-polished",dims:"60 × 40 × 3 cm",care:"Avoid moisture",ship:"10–14 days",cat:"Wall Art",price:8900,tag:null,stock:3,imgs:mk("#C8C0B4","#B8B0A4","#D4CCC0",5,1),maker:"Terrain Atelier",origin:"Bengaluru, Karnataka"},
  {id:3,name:"Arch Study I",sub:"Travertine Editions",mat:"Travertine Stone",finish:"Honed matte",dims:"H 42 × W 18 cm",care:"Seal annually",ship:"14–18 days",cat:"Sculptures",price:12500,tag:"Limited",stock:2,imgs:mk("#DCCEC0","#CCC0B0","#E8DDD0",8,2),maker:"Stone+Form Studio",origin:"Jodhpur, Rajasthan"},
  {id:4,name:"Linen Cascade",sub:"Woven Originals",mat:"Hand-woven Linen",finish:"Natural undyed",dims:"80 × 60 cm",care:"Spot clean only",ship:"5–7 days",cat:"Wall Art",price:6800,tag:null,stock:8,imgs:mk("#E0D8CC","#D4CCBF","#EBE5DC",4,3),maker:"Kavya Weaves",origin:"Kutch, Gujarat"},
  {id:5,name:"Form Candle Set",sub:"Ritual Objects",mat:"Beeswax + Soy blend",finish:"Hand-poured",dims:"Various H 12–18 cm",care:"Trim wick before use",ship:"3–5 days",cat:"Table Decor",price:2400,tag:null,stock:22,imgs:mk("#E4DCD0","#D8D0C4","#EEDEE8",5,4),maker:"Kohl & Wick",origin:"Mumbai, Maharashtra"},
  {id:6,name:"Pebble Tray",sub:"Alabaster Collection",mat:"Alabaster",finish:"Hand-polished",dims:"30 × 20 × 3 cm",care:"Avoid acids",ship:"7–10 days",cat:"Table Decor",price:5600,tag:"New",stock:6,imgs:mk("#CCC4B8","#BEB8AD","#D8D2C8",6,5),maker:"Nakshatra Studio",origin:"Delhi NCR"},
  {id:7,name:"Silence Frame",sub:"Object Portraits",mat:"Walnut + Linen",finish:"Oil-rubbed",dims:"50 × 40 × 4 cm",care:"Polish with beeswax",ship:"10–14 days",cat:"Wall Art",price:7200,tag:null,stock:0,imgs:mk("#C4BAB0","#B8AEA4","#D0C8BF",7,6),maker:"Atelier Vriksh",origin:"Coorg, Karnataka"},
  {id:8,name:"Column Vase",sub:"Raw Ceramic Series",mat:"Raw Ceramic",finish:"Smoke-fired",dims:"H 38 × Ø 10 cm",care:"Dry use only",ship:"7–10 days",cat:"Vessels",price:9800,tag:"Limited",stock:4,imgs:mk("#D8D0C8","#CCC4BB","#E4DCD4",5,7),maker:"Koram Pottery",origin:"Pondicherry"},
  {id:9,name:"Nomad Weave",sub:"Textile Study",mat:"Merino wool + jute",finish:"Hand-loomed",dims:"120 × 80 cm",care:"Dry clean",ship:"5–7 days",cat:"Textiles",price:11200,tag:"New",stock:5,imgs:mk("#D0C8BC","#C4BCAF","#DCE4D4",6,8),maker:"Pahadi Looms",origin:"Himachal Pradesh"},
  {id:10,name:"Mesa Lamp Base",sub:"Stone Lighting",mat:"Travertine",finish:"Natural cleft",dims:"H 32 × Ø 14 cm",care:"Wipe with damp cloth",ship:"14–18 days",cat:"Table Decor",price:14500,tag:null,stock:7,imgs:mk("#C8C2B8","#BCB6AC","#D4CECC",4,0),maker:"Quarry Forms",origin:"Rajasthan"},
  {id:11,name:"Fold Study III",sub:"Paper Series",mat:"Kozo + pigment",finish:"Washi hand-formed",dims:"45 × 35 cm",care:"Frame away from sunlight",ship:"5–7 days",cat:"Wall Art",price:4800,tag:null,stock:11,imgs:mk("#DDD8D0","#D1CCC4","#E5E0D8",5,1),maker:"Kagaz Collective",origin:"Pune, Maharashtra"},
  {id:12,name:"Earth Bowl",sub:"Wheel-thrown Series",mat:"Terracotta",finish:"Raw iron oxide",dims:"Ø 22 × H 8 cm",care:"Food safe if sealed",ship:"5–7 days",cat:"Table Decor",price:3200,tag:null,stock:16,imgs:mk("#CCC0B4","#C0B4A8","#D8CCBF",7,2),maker:"Kumhaar Studio",origin:"Khurja, UP"},
  {id:13,name:"Shadow Box I",sub:"Light Studies",mat:"Blackened steel + glass",finish:"Patinated",dims:"40 × 40 × 8 cm",care:"Wipe with microfibre",ship:"10–14 days",cat:"Wall Art",price:9600,tag:null,stock:3,imgs:mk("#B8B4B0","#ACA8A4","#C4C0BC",6,3),maker:"Forge Studio",origin:"Chennai, TN"},
  {id:14,name:"River Stone Set",sub:"Natural Mineral",mat:"Polished river stone",finish:"Oil-polished",dims:"Various 4–12 cm",care:"Re-oil monthly",ship:"3–5 days",cat:"Table Decor",price:2800,tag:"New",stock:30,imgs:mk("#C4C0BC","#B8B4B0","#D0CCC8",4,4),maker:"Riverbed Co.",origin:"Rishikesh, Uttarakhand"},
  {id:15,name:"Plinth No. 2",sub:"Display Objects",mat:"White marble",finish:"Leathered",dims:"H 30 × 15 × 15 cm",care:"Seal annually",ship:"14–18 days",cat:"Sculptures",price:18000,tag:"Limited",stock:2,imgs:mk("#E4E0DC","#D8D4D0","#F0ECEC",8,5),maker:"Marmo Atelier",origin:"Kishangarh, Rajasthan"},
  {id:16,name:"Grain Panel",sub:"Wood Studies",mat:"Reclaimed teak",finish:"Linseed oil",dims:"80 × 30 × 3 cm",care:"Re-oil annually",ship:"10–14 days",cat:"Wall Art",price:7800,tag:null,stock:9,imgs:mk("#C8B8A8","#BCAC9C","#D4C8B8",6,6),maker:"Teak & Timber",origin:"Kerala"},
  {id:17,name:"Wabi Vase",sub:"Asymmetric Series",mat:"Raku ceramic",finish:"Reduction-fired",dims:"H 24 × Ø 12 cm",care:"Decorative use only",ship:"7–10 days",cat:"Vessels",price:6200,tag:null,stock:7,imgs:mk("#D0C8C0","#C4BCB4","#DCDCD0",5,7),maker:"Mitti Studio",origin:"Ahmedabad, Gujarat"},
  {id:18,name:"Loom Fragment",sub:"Archive Textile",mat:"Natural silk + linen",finish:"Hand-knotted",dims:"90 × 60 cm",care:"Professional clean",ship:"7–10 days",cat:"Textiles",price:13800,tag:"Limited",stock:3,imgs:mk("#DDD4C8","#D1C8BC","#E5DED4",7,8),maker:"Varanasi Silk House",origin:"Varanasi, UP"},
  {id:19,name:"Dune Sculpture",sub:"Sand Series",mat:"Sandstone composite",finish:"Sand-blasted",dims:"H 36 × W 24 cm",care:"Indoor use only",ship:"14–18 days",cat:"Sculptures",price:16500,tag:"New",stock:4,imgs:mk("#D8D0C4","#CCCABC","#E4DCD0",6,0),maker:"Jaisalmer Forms",origin:"Jaisalmer, Rajasthan"},
  {id:20,name:"Monolith Clock",sub:"Time Objects",mat:"Black slate",finish:"Natural cleft",dims:"H 28 × W 18 cm",care:"Wipe with dry cloth",ship:"10–14 days",cat:"Table Decor",price:8400,tag:null,stock:6,imgs:mk("#A8A4A0","#9C9894","#B4B0AC",5,1),maker:"Schist Studio",origin:"Kangra, HP"},
  {id:21,name:"Breath Print",sub:"Limited Edition",mat:"Pigment on cotton rag",finish:"Archival inkjet",dims:"60 × 80 cm",care:"Frame under UV glass",ship:"7–10 days",cat:"Wall Art",price:11000,tag:"Limited",stock:5,imgs:mk("#E0DCD8","#D4D0CC","#ECEAE8",4,2),maker:"Paper Lung Studio",origin:"Bengaluru"},
  {id:22,name:"Hollow Vase",sub:"Thrown + Altered",mat:"Porcelain",finish:"Celadon glaze",dims:"H 32 × Ø 14 cm",care:"Dishwasher safe",ship:"5–7 days",cat:"Vessels",price:7600,tag:null,stock:10,imgs:mk("#D4DDD8","#C8D1CC","#E0E8E4",6,3),maker:"Matiwave Ceramics",origin:"Goa"},
  {id:23,name:"Terrain Tray",sub:"Landscape Series",mat:"Carved walnut",finish:"Beeswax",dims:"40 × 28 × 4 cm",care:"Oil monthly",ship:"7–10 days",cat:"Table Decor",price:4600,tag:null,stock:8,imgs:mk("#C0B4A4","#B4A898","#CCB8B0",7,4),maker:"Woodwork Collective",origin:"Dehradun, UK"},
  {id:24,name:"Gauze Hanging",sub:"Light Textile",mat:"Handwoven gauze",finish:"Natural loom finish",dims:"140 × 80 cm",care:"Hand wash cold",ship:"5–7 days",cat:"Textiles",price:9200,tag:"New",stock:6,imgs:mk("#ECE8E4","#E0DCD8","#F4F0EC",5,5),maker:"Khadi Loom House",origin:"Baroda, Gujarat"},
  {id:25,name:"Rough Hewn I",sub:"Stone Portraits",mat:"Basalt",finish:"Split face",dims:"H 45 × W 20 cm",care:"Wipe with dry cloth",ship:"14–18 days",cat:"Sculptures",price:22000,tag:"Limited",stock:1,imgs:mk("#9C9C9C","#909090","#A8A8A8",8,6),maker:"Lava Form Studio",origin:"Deccan Plateau"},
  {id:26,name:"Tide Bowl",sub:"Slip Cast Series",mat:"Stoneware",finish:"Satin iron glaze",dims:"Ø 28 × H 10 cm",care:"Oven safe up to 160°C",ship:"7–10 days",cat:"Table Decor",price:5200,tag:null,stock:12,imgs:mk("#B4C4C8","#A8B8BC","#C0D0D4",6,7),maker:"Slip Studio",origin:"Auroville, Pondicherry"},
  {id:27,name:"Lichen Study",sub:"Natural Abstracts",mat:"Cyanotype on linen",finish:"Hand-processed",dims:"50 × 70 cm",care:"Keep away from moisture",ship:"5–7 days",cat:"Wall Art",price:8200,tag:null,stock:4,imgs:mk("#C8D4C4","#BCCABC","#D4E0D0",5,8),maker:"Sun + Cloth Studio",origin:"Ooty, TN"},
  {id:28,name:"Arc Lamp",sub:"Form + Function",mat:"Brass + marble base",finish:"Brushed satin",dims:"H 160 × W 80 cm",care:"Polish with brass cloth",ship:"21–28 days",cat:"Table Decor",price:32000,tag:"New",stock:3,imgs:mk("#D4C89C","#C8BC90","#E0D4A8",4,0),maker:"Luminous Form Co.",origin:"Mumbai"},
  {id:29,name:"Memory Vessel",sub:"Heirloom Series",mat:"Thrown porcelain",finish:"Wood-fired",dims:"H 22 × Ø 16 cm",care:"Decorative",ship:"7–10 days",cat:"Vessels",price:8800,tag:"Limited",stock:3,imgs:mk("#D8D0C8","#CCCABC","#E4DCD4",7,1),maker:"Anagama Collective",origin:"Dharamsala, HP"},
  {id:30,name:"Silt Print",sub:"Pigment Studies",mat:"Mud resist on silk",finish:"Hand-dyed",dims:"100 × 60 cm",care:"Dry clean only",ship:"10–14 days",cat:"Textiles",price:15500,tag:null,stock:4,imgs:mk("#C8C4B8","#BCB8AC","#D4D0C4",6,2),maker:"Mud + Thread",origin:"Rajasthan"},
  {id:31,name:"Form Object IV",sub:"Studio Editions",mat:"Jesmonite",finish:"Pigmented cast",dims:"H 28 × W 18 cm",care:"Wipe with damp cloth",ship:"7–10 days",cat:"Sculptures",price:9400,tag:null,stock:7,imgs:mk("#D0CCE0","#C4C0D4","#DCDDE8",5,3),maker:"Cast Form Studio",origin:"Hyderabad, TG"},
  {id:32,name:"Reed Screen",sub:"Architectural Objects",mat:"Bamboo reed",finish:"Natural lacquer",dims:"180 × 80 cm",care:"Wipe with dry cloth",ship:"14–18 days",cat:"Wall Art",price:19800,tag:"New",stock:5,imgs:mk("#C8C4A8","#BCB89C","#D4D0B4",8,4),maker:"Bambu Studio",origin:"Assam"},
  {id:33,name:"Origin Stone",sub:"First Collection",mat:"Marble composite",finish:"Polished",dims:"Various 8–20 cm",care:"Seal every 2 years",ship:"5–7 days",cat:"Table Decor",price:6400,tag:null,stock:9,imgs:mk("#E0DCDC","#D4D0D0","#ECECE8",6,5),maker:"Shilp Studio",origin:"Udaipur, Rajasthan"},
];

const ARTICLES = [
  {slug:"on-negative-space",title:"On Negative Space",subtitle:"Why the objects you don't choose matter as much as the ones you do.",cat:"Philosophy",readTime:"6 min",c1:"#D8D0C4",c2:"#C4B8A8",body:["Consider the pause between notes in a piece of music. Remove it, and you have noise. Keep it, and you have composition. Interior spaces work in exactly this way — the emptiness around an object is not an absence but an active presence, giving the object room to breathe, to be seen, to be felt.","We live in an age of accumulation. Shopping has become a leisure activity, and interior design has followed suit — more objects, more surfaces covered, more colour, more texture. The result, in most homes, is visual noise. Not because any single thing is wrong, but because nothing has been allowed to be alone.","This is the philosophy behind our curation at Ghar & Grace. When we select a piece for the collection, we're not asking: is this beautiful? We're asking: is this worth the space it will take? Will it earn the silence around it? The vessel that sits alone on a shelf must be strong enough to hold that conversation with the empty air.","Negative space is not minimalism for its own sake. A room with one object in it is not automatically beautiful — it is simply empty. What we are talking about is intentional restraint. Choosing fewer things, and choosing them more carefully. Living with something for a season before deciding it belongs.",], featuredProducts:[1,8,3]},
  {slug:"the-slow-object",title:"The Slow Object",subtitle:"Against the disposable and for the enduring.",cat:"Material",readTime:"5 min",c1:"#C8C0B4",c2:"#B8B0A4",body:["There is a category of object that improves with time. The unglazed ceramic that absorbs the oils of handling and develops a patina. The walnut tray that deepens from pale blond to amber over years of use. The linen throw that softens with every wash. These objects tell a different story than the ones that arrive perfect and leave unchanged.","We call them slow objects. They require something from you — care, attention, the willingness to live with imperfection. In return, they become yours in a way that a machine-finished, factory-sealed product never can. They carry your use.","The economics of fast interiors are seductive. For the price of one considered piece, you can fill an entire shelf with reproductions. But there is a hidden cost: the reproduction will not deepen. It will not age. It will simply wear, and eventually, you will replace it with another reproduction, and the cycle continues indefinitely.","The slow object breaks this cycle. Its upfront cost is higher — in money, in care, in the patience required to live with something that is not yet fully yours. But the long-term value, in both material and meaning, is entirely different.",], featuredProducts:[16,4,23]},
  {slug:"light-and-surface",title:"Light and Surface",subtitle:"How material choice determines the quality of light in a room.",cat:"Design",readTime:"7 min",c1:"#E0DCD8",c2:"#D4D0CC",body:["Every material has a relationship with light. Some absorb it. Some scatter it. Some throw it back in concentrated beams. The stone that looks grey at noon becomes amber in late afternoon. The linen that looks flat under artificial light reveals its texture in daylight. Understanding these relationships is the difference between a room that works and one that merely contains furniture.","Matte surfaces — unglazed ceramics, honed stone, raw linen — create what lighting designers call diffuse reflection. They take the light that falls on them and scatter it softly in all directions. A room with many matte surfaces will feel warm, even in harsh light, because the light is never hard-edged.","Polished surfaces are the opposite. They concentrate light, creating points of interest, highlights, and shadow. Used sparingly, they give a room its punctuation — the alabaster bowl that catches the morning sun, the brass fitting that holds a point of warmth in the corner. Used too heavily, they create visual noise, reflections competing with each other across the room.","Our curation deliberately balances these qualities. We tend toward matte, with selective moments of sheen — the polished pebble tray among raw ceramic, the waxed walnut on a linen surface. The goal is always the same: light that lives in the room, rather than bouncing off it.",], featuredProducts:[6,10,15]},
];

const CRM_ORDERS = [
  {id:"GG-10482",customer:"Priya Sharma",product:"Arch Study I",amount:12500,status:"paid",date:"Mar 1",email:"priya@example.com"},
  {id:"GG-10481",customer:"Rohan Mehta",product:"Column Vase",amount:9800,status:"shipped",date:"Feb 28",email:"rohan@example.com"},
  {id:"GG-10480",customer:"Ananya Singh",product:"Linen Cascade",amount:6800,status:"paid",date:"Feb 27",email:"ananya@example.com"},
  {id:"GG-10479",customer:"Karan Joshi",product:"Plinth No. 2",amount:18000,status:"pending",date:"Feb 26",email:"karan@example.com"},
  {id:"GG-10478",customer:"Meera Pillai",product:"Mesa Lamp Base",amount:14500,status:"shipped",date:"Feb 25",email:"meera@example.com"},
  {id:"GG-10477",customer:"Arjun Nair",product:"Wabi Vase",amount:6200,status:"cancelled",date:"Feb 24",email:"arjun@example.com"},
  {id:"GG-10476",customer:"Divya Kapoor",product:"Loom Fragment",amount:13800,status:"paid",date:"Feb 23",email:"divya@example.com"},
];

// ═══════════════════════════════════════════════════════════════
// PRODUCT VISUAL RENDERER
// ═══════════════════════════════════════════════════════════════
function PV({c1,c2,t=0,style={}}){
  const vs=[
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect w="300" height="400" fill={c1}/><ellipse cx="150" cy="285" rx="66" ry="92" fill={c2}/><ellipse cx="150" cy="200" rx="38" ry="11" fill={c2} opacity=".7"/><rect x="132" y="189" width="36" height="15" fill={c2} opacity=".5"/></svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/>{[0,1,2,3,4,5].map(i=><line key={i} x1="40" y1={100+i*40} x2="260" y2={100+i*40} stroke={c2} strokeWidth={11-i*1.5} opacity={.85-i*.1}/>)}</svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/><path d="M150 55 Q215 160 192 295 Q166 368 150 385 Q134 368 108 295 Q85 160 150 55Z" fill={c2}/></svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/>{Array.from({length:14},(_,i)=><line key={i} x1="60" y1={65+i*22} x2={88+Math.sin(i*.85)*64} y2={65+i*22} stroke={c2} strokeWidth="3" opacity=".88"/>)}</svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/><rect x="98" y="188" width="104" height="15" fill={c2}/><path d="M122 203 L150 328 L178 203Z" fill={c2} opacity=".82"/><circle cx="150" cy="176" r="22" fill={c2}/></svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/><rect x="66" y="166" width="168" height="26" rx="3" fill={c2}/><rect x="88" y="192" width="124" height="96" rx="3" fill={c2} opacity=".78"/><rect x="108" y="288" width="84" height="11" rx="1" fill={c2} opacity=".52"/></svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/><rect x="68" y="78" width="164" height="244" fill={c2} opacity=".28"/><rect x="92" y="102" width="116" height="196" fill={c2} opacity=".54"/><rect x="112" y="122" width="76" height="156" fill={c2} opacity=".78"/></svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/><path d="M150 98 L150 338 M124 144 Q150 118 176 144 M108 196 Q150 164 192 196 M98 248 Q150 212 202 248 M92 298 Q150 258 208 298" stroke={c2} strokeWidth="3.5" fill="none"/><rect x="92" y="334" width="116" height="13" fill={c2}/></svg>,
    <svg style={{width:'100%',height:'100%',...style}} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><rect width="300" height="400" fill={c1}/><circle cx="150" cy="200" r="82" fill="none" stroke={c2} strokeWidth="2.5"/><circle cx="150" cy="200" r="56" fill={c2} opacity=".38"/><circle cx="150" cy="200" r="30" fill={c2} opacity=".7"/><line x1="150" y1="58" x2="150" y2="342" stroke={c2} strokeWidth="1" opacity=".38"/><line x1="8" y1="200" x2="292" y2="200" stroke={c2} strokeWidth="1" opacity=".38"/></svg>,
  ];
  // Fix: add width prop to first rect
  const el = vs[t%9];
  return el;
}

function CatSVG({c1,c2}){
  return(
    <svg style={{width:'100%',height:'100%',position:'absolute',inset:0}} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice">
      <rect width="500" height="500" fill={c1}/>
      <circle cx="250" cy="250" r="155" fill={c2} opacity=".22"/>
      <rect x="95" y="95" width="310" height="310" fill={c2} opacity=".1"/>
      <circle cx="250" cy="250" r="62" fill={c2} opacity=".18"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// WEBGL HERO CANVAS
// ═══════════════════════════════════════════════════════════════
function HeroCanvas(){
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const rafRef = useRef(null);
  const mouseTarget = useRef({x:.5,y:.5});
  const mouseSmooth = useRef({x:.5,y:.5});
  const tRef = useRef(0);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;

    // Try WebGL
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if(gl) gl.viewport(0,0,canvas.width,canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    if(!gl){
      // Canvas2D fallback
      const ctx = canvas.getContext('2d');
      const draw2d = () => {
        const W=canvas.width, H=canvas.height;
        tRef.current += .008;
        mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x)*.03;
        mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y)*.03;
        ctx.clearRect(0,0,W,H);
        const bg = ctx.createLinearGradient(0,0,W,H);
        bg.addColorStop(0,'#EDE5D8'); bg.addColorStop(1,'#D8CCBC');
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
        [[mouseSmooth.current.x,.3+Math.sin(tRef.current*.6)*.1],[.7+Math.cos(tRef.current*.5)*.1,.5+Math.sin(tRef.current*.4)*.1],[.4+Math.sin(tRef.current*.7)*.08,.7+Math.cos(tRef.current*.8)*.08]].forEach(([bx,by],i)=>{
          const r = ctx.createRadialGradient(bx*W,by*H,0,bx*W,by*H,W*(i===0?.3:.22));
          r.addColorStop(0,`rgba(196,184,164,${i===0?.45:.28})`);
          r.addColorStop(1,'rgba(196,184,164,0)');
          ctx.fillStyle=r; ctx.fillRect(0,0,W,H);
        });
        // grain
        for(let i=0;i<W*H*.004;i++){
          ctx.fillStyle=`rgba(150,140,130,${Math.random()*.04})`;
          ctx.fillRect(Math.random()*W,Math.random()*H,1,1);
        }
        rafRef.current = requestAnimationFrame(draw2d);
      };
      rafRef.current = requestAnimationFrame(draw2d);
    } else {
      // WebGL
      const vert = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0,1); }`;
      const frag = `
        precision mediump float;
        uniform vec2 u_res; uniform vec2 u_mouse; uniform float u_time;
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float blob(vec2 uv, vec2 center, float r){
          float d = length(uv-center); return smoothstep(r,0.,d);
        }
        void main(){
          vec2 uv = gl_FragCoord.xy/u_res;
          uv.y = 1.-uv.y;
          vec3 base = mix(vec3(.929,.898,.847),vec3(.847,.8,.737),uv.y+uv.x*.2);
          float b1 = blob(uv, vec2(u_mouse.x*.85+.08, u_mouse.y*.85+.08), .32);
          float b2 = blob(uv, vec2(.7+sin(u_time*.5)*.09,.5+cos(u_time*.4)*.1), .28);
          float b3 = blob(uv, vec2(.35+cos(u_time*.6)*.07,.72+sin(u_time*.7)*.08), .22);
          float b4 = blob(uv, vec2(.5+sin(u_time*.3)*.1,.2+cos(u_time*.5)*.06), .2);
          vec3 blob_col = vec3(.769,.722,.643);
          base += blob_col*(b1*.42+b2*.26+b3*.24+b4*.2);
          // Grid lines
          vec2 guv = fract(uv*8.);
          float gx = smoothstep(.0,.02,guv.x)+smoothstep(1.,.98,guv.x);
          float gy = smoothstep(.0,.02,guv.y)+smoothstep(1.,.98,guv.y);
          float grid = max(gx,gy);
          // Grid distortion near mouse
          float md = length(uv-u_mouse);
          grid *= (1.-.08*smoothstep(.4,0.,md));
          base -= grid*.055;
          // Grain
          float grain = hash(uv+fract(u_time))*.04;
          base += grain-.02;
          gl_FragColor = vec4(clamp(base,0.,1.),1.);
        }
      `;
      const compile = (type,src) => {
        const s = gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER,vert));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER,frag));
      gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog,'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      const uRes=gl.getUniformLocation(prog,'u_res');
      const uMouse=gl.getUniformLocation(prog,'u_mouse');
      const uTime=gl.getUniformLocation(prog,'u_time');
      glRef.current=prog;
      const drawGL = () => {
        tRef.current += .008;
        mouseSmooth.current.x += (mouseTarget.current.x-mouseSmooth.current.x)*.03;
        mouseSmooth.current.y += (mouseTarget.current.y-mouseSmooth.current.y)*.03;
        gl.uniform2f(uRes,canvas.width,canvas.height);
        gl.uniform2f(uMouse,mouseSmooth.current.x,mouseSmooth.current.y);
        gl.uniform1f(uTime,tRef.current);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        rafRef.current = requestAnimationFrame(drawGL);
      };
      rafRef.current = requestAnimationFrame(drawGL);
    }

    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      mouseTarget.current = {x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height};
    };
    window.addEventListener('mousemove',onMove);

    const onVis = () => {
      if(document.hidden){ cancelAnimationFrame(rafRef.current); }
    };
    document.addEventListener('visibilitychange',onVis);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',resize);
      window.removeEventListener('mousemove',onMove);
      document.removeEventListener('visibilitychange',onVis);
    };
  },[]);

  return <canvas ref={canvasRef} className="hero-canvas" style={{width:'100%',height:'100%'}}/>;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════
function Cursor(){
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef(Array.from({length:8},()=>({current:null})));
  const mouse = useRef({x:0,y:0});
  const ring  = useRef({x:0,y:0});
  const trail = useRef(Array(8).fill({x:0,y:0}));
  const [cursorState, setCursorState] = useState({hover:false,imageHover:false,label:''});
  const rafRef = useRef(null);

  useEffect(()=>{
    const lerp=(a,b,t)=>a+(b-a)*t;

    const onMove = e => { mouse.current={x:e.clientX,y:e.clientY}; };
    window.addEventListener('mousemove',onMove);

    // Hover detection via data-cursor
    const onOver = e => {
      const el = e.target.closest('[data-cursor]');
      const isImg = e.target.closest('.pcard-img,[data-cursor="Explore"]');
      if(el){
        setCursorState({hover:true,imageHover:!!isImg,label:el.dataset.cursor||''});
      } else if(isImg){
        setCursorState({hover:true,imageHover:true,label:'Explore'});
      } else {
        const clickable = e.target.closest('a,button,[role=button],.pcard,.cursor-pointer');
        setCursorState(s=>({...s,hover:!!clickable,imageHover:false,label:clickable?s.label:''}));
      }
    };
    document.addEventListener('mouseover',onOver);

    const onClick = e => {
      const ripple = document.createElement('div');
      ripple.className='cur-ripple';
      ripple.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;width:40px;height:40px;margin:-20px`;
      document.body.appendChild(ripple);
      setTimeout(()=>ripple.remove(),700);
    };
    window.addEventListener('click',onClick);

    const animate = () => {
      const lerpF = .10;
      ring.current.x = lerp(ring.current.x, mouse.current.x, lerpF);
      ring.current.y = lerp(ring.current.y, mouse.current.y, lerpF);

      trail.current = trail.current.map((p,i)=>{
        const src = i===0 ? ring.current : trail.current[i-1];
        return { x: lerp(p.x,src.x,.18-i*.015), y: lerp(p.y,src.y,.18-i*.015) };
      });

      if(dotRef.current){
        dotRef.current.style.left = mouse.current.x+'px';
        dotRef.current.style.top  = mouse.current.y+'px';
      }
      if(ringRef.current){
        ringRef.current.style.left = ring.current.x+'px';
        ringRef.current.style.top  = ring.current.y+'px';
      }
      trail.current.forEach((p,i)=>{
        const el = trailRefs.current[i]?.current;
        if(el){ el.style.left=p.x+'px'; el.style.top=p.y+'px'; }
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return ()=>{
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove',onMove);
      document.removeEventListener('mouseover',onOver);
      window.removeEventListener('click',onClick);
    };
  },[]);

  return(
    <>
      <div ref={dotRef} className={`cur-dot${cursorState.hover?' hover':''}`}/>
      <div ref={ringRef} className={`cur-ring${cursorState.hover?' hover':''}${cursorState.imageHover?' image-hover':''}`}>
        <span className="cur-ring-label">{cursorState.label}</span>
      </div>
      {trailRefs.current.map((r,i)=>(
        <div key={i} ref={r} className="cur-trail" style={{
          width: Math.max(1,4-i*.4)+'px', height: Math.max(1,4-i*.4)+'px',
          opacity: (.38-i*.04),
        }}/>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAGNETIC BUTTON
// ═══════════════════════════════════════════════════════════════
function MagBtn({children, className='', onClick, style={}, dataCursor=''}){
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const vel = useRef({x:0,y:0});
  const pos = useRef({x:0,y:0});
  const active = useRef(false);
  const rafRef = useRef(null);

  useEffect(()=>{
    const el = wrapRef.current;
    if(!el) return;
    const STIFFNESS=.15, DAMPING=.72, THRESHOLD=80;

    const spring = () => {
      const target = active.current ? pos.current : {x:0,y:0};
      vel.current.x += (target.x-pos.current.x)*STIFFNESS;
      vel.current.y += (target.y-pos.current.y)*STIFFNESS;
      vel.current.x *= DAMPING; vel.current.y *= DAMPING;
      pos.current.x += vel.current.x; pos.current.y += vel.current.y;
      el.style.transform = `translate(${pos.current.x*.3}px,${pos.current.y*.3}px)`;
      if(innerRef.current)
        innerRef.current.style.transform = `translate(${pos.current.x*.5}px,${pos.current.y*.5}px)`;
      if(Math.abs(vel.current.x)+Math.abs(vel.current.y) > .05 || active.current)
        rafRef.current = requestAnimationFrame(spring);
    };

    const onMove = e => {
      const r = el.getBoundingClientRect();
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const dx=e.clientX-cx, dy=e.clientY-cy;
      if(Math.sqrt(dx*dx+dy*dy)<THRESHOLD){ active.current=true; pos.current={x:dx,y:dy}; }
      else if(active.current){ active.current=false; }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(spring);
    };
    const onLeave = () => { active.current=false; cancelAnimationFrame(rafRef.current); rafRef.current=requestAnimationFrame(spring); };

    window.addEventListener('mousemove',onMove);
    el.addEventListener('mouseleave',onLeave);
    return()=>{ window.removeEventListener('mousemove',onMove); el.removeEventListener('mouseleave',onLeave); cancelAnimationFrame(rafRef.current); };
  },[]);

  return(
    <div ref={wrapRef} className="mag-btn-wrap" style={{display:'inline-block',...style}}>
      <div ref={innerRef} data-cursor={dataCursor} onClick={onClick} className={className}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL HOOK
// ═══════════════════════════════════════════════════════════════
function useScrollReveal(){
  const revealed = useRef(new Set());
  useEffect(()=>{
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const el = entry.target;
          const idx = parseInt(el.dataset.revealIdx||0);
          const delay = parseInt(el.dataset.revealDelay||0) + idx*80;
          setTimeout(()=>{ el.classList.add('visible'); },delay);
          io.unobserve(el);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});

    const targets = document.querySelectorAll('.reveal-word,.reveal-card,.reveal-scale,.reveal-fade');
    targets.forEach(t=>{ if(!revealed.current.has(t)){ io.observe(t); revealed.current.add(t); } });
    return()=>io.disconnect();
  });
}

function RevealText({children, className='', delay=0, tag='h2'}){
  const Tag = tag;
  const words = String(children).split(' ');
  return(
    <Tag className={className}>
      {words.map((w,i)=>(
        <span key={i} className="reveal-word" data-reveal-idx={i} data-reveal-delay={delay} style={{marginRight:'0.28em'}}>
          {w}
        </span>
      ))}
    </Tag>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSITION
// ═══════════════════════════════════════════════════════════════
function PageTransition({children, pageKey}){
  const [state,setState] = useState('idle');
  const [display,setDisplay] = useState(children);
  const [pendingKey,setPendingKey] = useState(null);
  const prevKey = useRef(pageKey);

  useEffect(()=>{
    if(pageKey !== prevKey.current){
      setState('enter');
      setPendingKey(pageKey);
      const t1 = setTimeout(()=>{
        setDisplay(children);
        setState('exit');
        prevKey.current = pageKey;
        setTimeout(()=>setState('idle'),400);
      },380);
      return()=>clearTimeout(t1);
    } else {
      setDisplay(children);
    }
  },[pageKey, children]);

  return(
    <>
      <div className={`pt-curtain${state==='enter'?' enter':state==='exit'?' exit':''}`}/>
      <div key={prevKey.current} className="page-wrap">{display}</div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════
function Toast({msg}){
  return <div className={`toast${msg?' show':''}`}><span style={{fontSize:14}}>✓</span><span>{msg}</span></div>;
}

// ═══════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════
function Nav({page,setPage,cartCount,onCartOpen,isCRM}){
  const [scrolled,setScrolled]=useState(false);
  const badgeRef=useRef(null);
  const prevCount=useRef(cartCount);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>50);
    window.addEventListener('scroll',h); return()=>window.removeEventListener('scroll',h);
  },[]);

  useEffect(()=>{
    if(cartCount>prevCount.current && badgeRef.current){
      badgeRef.current.classList.remove('pulse');
      void badgeRef.current.offsetWidth;
      badgeRef.current.classList.add('pulse');
    }
    prevCount.current=cartCount;
  },[cartCount]);

  if(isCRM) return null;
  return(
    <nav className={`nav${scrolled?' solid':''}`}>
      <div className="logo" onClick={()=>setPage('home')}>Ghar <em>& Grace</em></div>
      <ul className="nav-links">
        {[['home','Home'],['shop','Shop'],['journal','Journal'],['about','About']].map(([p,l])=>(
          <li key={p}><a className={page===p||page.startsWith('product')&&p==='shop'||page.startsWith('article')&&p==='journal'?'active':''} onClick={()=>setPage(p)}>{l}</a></li>
        ))}
      </ul>
      <div className="nav-right">
        <button className="nav-icon" data-cursor="Search" title="Search">🔍</button>
        <button className="nav-icon" data-cursor="Saved" onClick={()=>setPage('wishlist')} title="Wishlist">♡</button>
        <button className="nav-icon" data-cursor="Cart" onClick={onCartOpen} title="Cart" style={{position:'relative'}}>
          🛍
          {cartCount>0&&<span ref={badgeRef} className="cart-badge">{cartCount}</span>}
        </button>
        <button className="nav-icon" onClick={()=>setPage('crm')} title="CRM" style={{fontSize:13,opacity:.6}}>⚙</button>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// AMBIENT SOUND
// ═══════════════════════════════════════════════════════════════
function AmbientSound({isCRM}){
  const [active,setActive]=useState(false);
  const audioCtx=useRef(null);
  const gainNode=useRef(null);
  const osc=useRef(null);

  const toggle = () => {
    if(!active){
      if(!audioCtx.current){ audioCtx.current=new (window.AudioContext||window.webkitAudioContext)(); }
      gainNode.current=audioCtx.current.createGain();
      gainNode.current.gain.setValueAtTime(0,audioCtx.current.currentTime);
      gainNode.current.gain.linearRampToValueAtTime(.04,audioCtx.current.currentTime+2);
      gainNode.current.connect(audioCtx.current.destination);
      osc.current=audioCtx.current.createOscillator();
      osc.current.type='sine'; osc.current.frequency.value=55;
      osc.current.connect(gainNode.current); osc.current.start();
      setActive(true);
    } else {
      gainNode.current.gain.setValueAtTime(gainNode.current.gain.value,audioCtx.current.currentTime);
      gainNode.current.gain.linearRampToValueAtTime(0,audioCtx.current.currentTime+1.5);
      setTimeout(()=>{ try{ osc.current.stop(); }catch(e){} setActive(false); },1600);
    }
  };

  if(isCRM) return null;
  return(
    <button className={`sound-toggle${active?' active':''}`} onClick={toggle} title="Ambient sound">
      <div style={{display:'flex',alignItems:'flex-end',height:18,gap:2}}>
        {[14,10,18].map((h,i)=>(
          <div key={i} className={`sound-bar sound-bar-${i+1}`} style={{height:h,transformOrigin:'bottom'}}/>
        ))}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAR RATING
// ═══════════════════════════════════════════════════════════════
function Stars({rating=0,max=5,size=14}){
  return(
    <div className="stars">
      {Array.from({length:max},(_,i)=>(
        <svg key={i} className="star-svg" width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i<Math.floor(rating)?'#C4B8A4':'none'}
            stroke="#C4B8A4" strokeWidth="1.5"/>
        </svg>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT CARD
// ═══════════════════════════════════════════════════════════════
function ProductCard({p,setPage,addToCart,wishlist,toggleWish,revealDelay=0}){
  const wished=wishlist.includes(p.id);
  const soldOut=p.stock===0;
  const lowStock=p.stock>0&&p.stock<5;

  return(
    <div className="pcard reveal-card" data-reveal-idx={revealDelay} onClick={()=>!soldOut&&setPage('product-'+p.id)}>
      <div className="pcard-lift">
        <div className="pcard-img" data-cursor="Explore">
          <div className="pcard-img-layer primary">
            <PV c1={p.imgs[0].c1} c2={p.imgs[0].c2} t={p.imgs[0].t} style={{width:'100%',height:'100%'}}/>
          </div>
          {p.imgs[1]&&(
            <div className="pcard-img-layer secondary">
              <PV c1={p.imgs[1].c1} c2={p.imgs[1].c2} t={p.imgs[1].t} style={{width:'100%',height:'100%'}}/>
            </div>
          )}
          {p.tag&&<span className="pcard-tag">{p.tag}</span>}
          {lowStock&&<span className="low-stock-dot">Low</span>}
          {soldOut&&<div className="sold-out-overlay"><span className="sold-out-label">Sold Out</span></div>}
          <button className={`pcard-wish${wished?' active':''}`} onClick={e=>{e.stopPropagation();toggleWish(p.id,e);}} data-cursor={wished?"Saved":"Save"}>
            {wished?'♥':'♡'}
          </button>
          {!soldOut&&(
            <div className="pcard-overlay">
              <button className="pcard-quick" onClick={e=>{e.stopPropagation();setPage('product-'+p.id);}}>Quick View</button>
            </div>
          )}
        </div>
        <div className="pcard-info">
          <div className="pcard-name">{p.name}</div>
          <div className="pcard-mat">{p.mat} — {p.cat}</div>
          <div className="pcard-footer">
            <span className="pcard-price"><span className="price-sym">₹</span>{p.price.toLocaleString('en-IN')}</span>
            {!soldOut&&(
              <MagBtn onClick={e=>{e.stopPropagation();addToCart(p);}} dataCursor="Add">
                <button className="pcard-add" data-cursor="Add"><span>Add</span></button>
              </MagBtn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DUAL RANGE SLIDER
// ═══════════════════════════════════════════════════════════════
function DualRange({min=0,max=35000,value,onChange}){
  const trackRef=useRef(null);
  const [lo,setLo]=useState(value?.[0]||0);
  const [hi,setHi]=useState(value?.[1]||35000);
  const dragging=useRef(null);

  const toPercent=(v)=>((v-min)/(max-min))*100;

  const onMouseDown=(which)=>(e)=>{
    dragging.current=which; e.preventDefault();
    const move=(ev)=>{
      const r=trackRef.current.getBoundingClientRect();
      const pct=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));
      const val=Math.round((min+(max-min)*pct)/500)*500;
      if(dragging.current==='lo'){ const nlo=Math.min(val,hi-500); setLo(nlo); onChange([nlo,hi]); }
      else { const nhi=Math.max(val,lo+500); setHi(nhi); onChange([lo,nhi]); }
    };
    const up=()=>{ dragging.current=null; window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  };

  const loP=toPercent(lo), hiP=toPercent(hi);
  return(
    <div>
      <div className="range-wrap" ref={trackRef}>
        <div className="range-track"/>
        <div className="range-fill" style={{left:loP+'%',width:(hiP-loP)+'%'}}/>
        <div className="range-thumb" style={{left:loP+'%'}} onMouseDown={onMouseDown('lo')}/>
        <div className="range-thumb" style={{left:hiP+'%'}} onMouseDown={onMouseDown('hi')}/>
      </div>
      <div className="range-labels"><span>₹{(lo/1000).toFixed(0)}k</span><span>₹{(hi/1000).toFixed(0)}k</span></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CART DRAWER
// ═══════════════════════════════════════════════════════════════
const PROMOS = {'GRACE10':{type:'percent',val:10},'FIRSTORDER':{type:'flat',val:500},'GHAR20':{type:'percent',val:20}};

function CartDrawer({open,onClose,cart,setCart,setPage}){
  const [promo,setPromo]=useState('');
  const [promoApplied,setPromoApplied]=useState(null);
  const [promoError,setPromoError]=useState('');

  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping=subtotal>=5000?0:299;
  let discount=0;
  if(promoApplied){
    if(promoApplied.type==='percent') discount=Math.round(subtotal*promoApplied.val/100);
    else discount=promoApplied.val;
  }
  const total=subtotal+shipping-discount;

  const applyPromo=()=>{
    const code=PROMOS[promo.toUpperCase()];
    if(code){ setPromoApplied(code); setPromoError(''); }
    else { setPromoError('Invalid code'); setPromoApplied(null); }
  };

  const removeItem=(idx)=>setCart(c=>c.filter((_,i)=>i!==idx));
  const updateQty=(idx,d)=>setCart(c=>c.map((item,i)=>i===idx?{...item,qty:Math.max(1,item.qty+d)}:item));

  return(
    <>
      <div className={`cart-overlay${open?' open':''}`} onClick={onClose}/>
      <div className={`cart-drawer${open?' open':''}`}>
        <div className="cart-hdr">
          <span className="cart-hdr-title">Cart ({cart.reduce((s,i)=>s+i.qty,0)})</span>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>
        <div className="cart-items">
          {cart.length===0?(
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <div className="cart-empty-t">Nothing here yet.</div>
              <div className="cart-empty-s">Add something beautiful.</div>
            </div>
          ):cart.map((item,idx)=>(
            <div className="cart-item" key={idx}>
              <div className="cart-item-img">
                <PV c1={item.imgs[0].c1} c2={item.imgs[0].c2} t={item.imgs[0].t} style={{width:'100%',height:'100%'}}/>
              </div>
              <div>
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-meta">{item.mat}</div>
                <div className="cart-item-row">
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button style={{background:'none',border:'1px solid var(--sand)',width:24,height:24,cursor:'pointer',fontSize:14}} onClick={()=>updateQty(idx,-1)}>−</button>
                    <span style={{fontSize:13,minWidth:16,textAlign:'center'}}>{item.qty}</span>
                    <button style={{background:'none',border:'1px solid var(--sand)',width:24,height:24,cursor:'pointer',fontSize:14}} onClick={()=>updateQty(idx,1)}>+</button>
                  </div>
                  <span className="cart-item-price"><span className="price-sym">₹</span>{(item.price*item.qty).toLocaleString('en-IN')}</span>
                </div>
                <button className="cart-item-remove" onClick={()=>removeItem(idx)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length>0&&(
          <div className="cart-footer">
            <div className="promo-wrap">
              <input className={`promo-input${promoApplied?' valid':''}`} placeholder="Promo code" value={promo} onChange={e=>setPromo(e.target.value)} onKeyDown={e=>e.key==='Enter'&&applyPromo()}/>
              <button className="promo-btn" onClick={applyPromo}>Apply</button>
            </div>
            {promoError&&<p style={{fontSize:11,color:'var(--terracotta)',marginBottom:10}}>{promoError}</p>}
            {promoApplied&&(
              <div className="promo-success">
                <svg width="14" height="14" viewBox="0 0 14 14"><polyline className="promo-check" points="2,7 6,11 12,3" stroke="#7A8C7A" strokeWidth="2" fill="none" strokeDasharray="20" strokeDashoffset="0"/></svg>
                Code applied — {promoApplied.type==='percent'?promoApplied.val+'% off':'₹'+promoApplied.val+' off'}
              </div>
            )}
            <div className="cart-totals">
              <div className="cart-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="cart-total-row"><span>Shipping</span><span>{shipping===0?'Free':'₹'+shipping}</span></div>
              {discount>0&&<div className="discount-line"><span>Discount</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>}
            </div>
            <div className="cart-grand-row">
              <span className="cart-grand-lbl">Total</span>
              <span className="cart-grand-val"><span className="price-sym">₹</span>{total.toLocaleString('en-IN')}</span>
            </div>
            <button className="cart-checkout-btn" onClick={()=>{onClose();setPage('payment');}}>Proceed to Checkout</button>
            <button className="cart-continue" onClick={onClose}>Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// WISHLIST HEART PARTICLE BURST
// ═══════════════════════════════════════════════════════════════
function burstParticles(x,y){
  Array.from({length:8},(_,i)=>{
    const el=document.createElement('div');
    el.className='wish-particle';
    const angle=(i/8)*Math.PI*2;
    const dist=20+Math.random()*12;
    el.style.cssText=`left:${x}px;top:${y}px;--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;animation-delay:${i*15}ms`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),600);
  });
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
function HomePage({setPage,addToCart,wishlist,toggleWish}){
  useScrollReveal();
  const statsRef=useRef(null);
  const [statsVisible,setStatsVisible]=useState(false);
  const [counts,setCounts]=useState([0,0,0,0]);
  const targets=[120,40,8,100];

  useEffect(()=>{
    const io=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ setStatsVisible(true); io.disconnect(); }},{threshold:.3});
    if(statsRef.current) io.observe(statsRef.current);
    return()=>io.disconnect();
  },[]);

  useEffect(()=>{
    if(!statsVisible) return;
    const dur=1200, fps=60;
    const frames=dur/(1000/fps);
    let f=0;
    const timer=setInterval(()=>{
      f++;
      const t=f/frames; const ease=1-Math.pow(1-t,4);
      setCounts(targets.map(v=>Math.round(v*Math.min(ease,1))));
      if(f>=frames) clearInterval(timer);
    },1000/fps);
    return()=>clearInterval(timer);
  },[statsVisible]);

  return(
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-canvas-wrap"><HeroCanvas/></div>
        <div className="hero-left">
          <span className="hero-eyebrow">Design-Led Interiors · Est. 2021</span>
          <h1 className="hero-h1">Every space<br/>deserves to feel<br/><em>considered.</em></h1>
          <p className="hero-sub">We curate objects that bring intention to interiors — each piece chosen for material integrity, quiet beauty, and lasting presence.</p>
          <div className="hero-btns">
            <MagBtn onClick={()=>setPage('shop')} dataCursor="Explore">
              <button className="btn-p" data-cursor="Explore"><span>Explore Collection</span></button>
            </MagBtn>
            <button className="btn-g" onClick={()=>setPage('about')}>Our Philosophy →</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-right-inner">
            <PV c1="#DDD4C8" c2="#C8BCAE" t={2} style={{width:'100%',height:'100%'}}/>
          </div>
          <div className="hero-float-card">
            <div className="hero-float-title">Arch Study I</div>
            <div className="hero-float-sub">Travertine · Limited</div>
            <div className="hero-float-price"><span className="price-sym">₹</span>12,500</div>
          </div>
          <div className="hero-badge">Elevating<br/>Everyday<br/>Spaces</div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-outer">
        <div className="marquee-track">
          {[...Array(3)].map((_,k)=>(
            <span key={k} style={{display:'flex',gap:64,alignItems:'center'}}>
              {CATS.map(c=><span key={c} className="marquee-item">{c}</span>)}
              <span className="marquee-em">Crafted with Intention</span>
              <span className="marquee-item">Free Shipping Above ₹5,000</span>
              <span className="marquee-em">Limited Editions Available</span>
              <span className="marquee-item">33 Curated Objects</span>
            </span>
          ))}
        </div>
      </div>

      {/* PHILOSOPHY */}
      <section className="philosophy">
        <div className="section-number">01</div>
        <div>
          <span className="eyebrow reveal-fade">Our Approach</span>
          <RevealText className="phil-title" delay={100}>Design that lives with you, not for you.</RevealText>
        </div>
        <div>
          <p className="phil-p reveal-fade">At Ghar & Grace, we believe the spaces we inhabit shape how we feel. A well-chosen object doesn't demand attention — it earns it slowly, over years of living alongside it.</p>
          <p className="phil-p reveal-fade" style={{transitionDelay:'.1s'}}>We work with artisans, potters, and independent studios. Nothing trend-driven. Nothing disposable. Everything considered.</p>
        </div>
      </section>

      {/* FEATURED */}
      <section className="products-section">
        <div className="sec-hdr">
          <RevealText className="sec-title" tag="h2">Featured Objects</RevealText>
          <span className="sec-link" onClick={()=>setPage('shop')}>View all 33 →</span>
        </div>
        <div className="products-grid">
          {P.slice(0,8).map((p,i)=>(
            <ProductCard key={p.id} p={p} setPage={setPage} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} revealDelay={i}/>
          ))}
        </div>
      </section>

      {/* CATS */}
      <div className="cats-grid">
        {[
          {n:"Wall Art",sub:"Curated",c1:"#8A8478",c2:"#6A645A"},
          {n:"Sculptures",sub:"Tactile",c1:"#7A7470",c2:"#5A5452"},
          {n:"Vessels",sub:"Handmade",c1:"#8C8480",c2:"#6C6460"},
          {n:"Table Decor",sub:"Considered",c1:"#9A9088",c2:"#7A706A"},
          {n:"Textiles",sub:"Woven",c1:"#8A8880",c2:"#6A6860"},
        ].map(c=>(
          <div className="cat-card reveal-scale" key={c.n} onClick={()=>setPage('shop')} data-cursor="Explore">
            <div className="cat-bg"><CatSVG c1={c.c1} c2={c.c2}/></div>
            <div className="cat-overlay"/>
            <div className="cat-lbl">
              <div className="cat-lbl-sub">{c.sub}</div>
              <div className="cat-lbl-title">{c.n}</div>
            </div>
          </div>
        ))}
      </div>

      {/* HOSPITALITY */}
      <section className="hosp" ref={statsRef}>
        <div>
          <span className="eyebrow" style={{color:'var(--taupe)'}}>Hospitality & Projects</span>
          <h2 className="hosp-title">Spaces designed for<br/><em>lasting impressions.</em></h2>
          <p className="hosp-text">We collaborate with hotels, restaurants, and residences to curate spaces that feel coherent, considered, and distinctly their own.</p>
          <MagBtn dataCursor="Inquire">
            <button className="btn-l"><span>Inquire About a Project</span></button>
          </MagBtn>
        </div>
        <div className="hosp-stats">
          {[["Projects",0],["Studios",1],["Cities",2],["Design-Led",3]].map(([l,i])=>(
            <div key={l}>
              <div className="stat-n">{counts[i]}{i===3?'%':'+'}</div>
              <div className="stat-l">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <div className="footer-brand">Ghar <em style={{fontStyle:'italic',color:'var(--muted)'}}>& Grace</em></div>
          <p className="footer-tagline">Curated objects for interiors that feel considered, calm, and enduringly beautiful.</p>
        </div>
        {[["Explore",["Shop All","Wall Art","Table Decor","Sculptures","New Arrivals"]],["Studio",["About","Philosophy","Hospitality","Press","Careers"]],["Support",["Shipping & Returns","Care Guide","Track Order","Contact","FAQ"]]].map(([t,ls])=>(
          <div key={t}><div className="footer-col-title">{t}</div><ul className="footer-links">{ls.map(l=><li key={l}><a>{l}</a></li>)}</ul></div>
        ))}
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Ghar & Grace. All rights reserved.</span>
          <span className="footer-copy">Mumbai · hello@gharandgrace.com</span>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHOP PAGE
// ═══════════════════════════════════════════════════════════════
function ShopPage({setPage,addToCart,wishlist,toggleWish}){
  useScrollReveal();
  const [activeCat,setActiveCat]=useState('All');
  const [priceRange,setPriceRange]=useState([0,35000]);
  const [activeMats,setActiveMats]=useState([]);
  const [activeAvail,setActiveAvail]=useState([]);
  const [sort,setSort]=useState('featured');
  const [visibleCount,setVisibleCount]=useState(12);
  const [loading,setLoading]=useState(false);

  const MATS=['Stoneware','Marble','Wood','Textile','Metal','Ceramic'];
  const AVAIL=['In Stock','Limited Edition','New Arrivals'];

  const toggleMat=m=>setActiveMats(a=>a.includes(m)?a.filter(x=>x!==m):[...a,m]);
  const toggleAvail=v=>setActiveAvail(a=>a.includes(v)?a.filter(x=>x!==v):[...a,v]);

  const pills=[
    ...(activeCat!=='All'?[{label:activeCat,remove:()=>setActiveCat('All')}]:[]),
    ...(priceRange[0]>0||priceRange[1]<35000?[{label:`₹${priceRange[0]/1000}k–₹${priceRange[1]/1000}k`,remove:()=>setPriceRange([0,35000])}]:[]),
    ...activeMats.map(m=>({label:m,remove:()=>toggleMat(m)})),
    ...activeAvail.map(v=>({label:v,remove:()=>toggleAvail(v)})),
  ];

  let filtered=[...P].filter(p=>{
    if(activeCat!=='All'&&p.cat!==activeCat) return false;
    if(p.price<priceRange[0]||p.price>priceRange[1]) return false;
    if(activeMats.length&&!activeMats.some(m=>p.mat.toLowerCase().includes(m.toLowerCase()))) return false;
    if(activeAvail.includes('In Stock')&&p.stock===0) return false;
    if(activeAvail.includes('Limited Edition')&&p.tag!=='Limited') return false;
    if(activeAvail.includes('New Arrivals')&&p.tag!=='New') return false;
    return true;
  });
  if(sort==='price_asc') filtered.sort((a,b)=>a.price-b.price);
  if(sort==='price_desc') filtered.sort((a,b)=>b.price-a.price);
  if(sort==='newest') filtered.sort((a,b)=>b.id-a.id);

  const loadMore=()=>{
    setLoading(true);
    setTimeout(()=>{ setVisibleCount(n=>n+6); setLoading(false); },600);
  };

  const visible=filtered.slice(0,visibleCount);

  return(
    <div>
      <div className="shop-hero">
        <div>
          <span className="eyebrow">The Collection</span>
          <h1 className="shop-title">All<br/>Objects</h1>
        </div>
        <span style={{fontSize:13,color:'var(--muted)'}}>{filtered.length} pieces</span>
      </div>
      <div className="shop-layout">
        <aside className="filters-panel">
          <div className="fg">
            <div className="fg-title">Category</div>
            {['All',...CATS].map(c=>(
              <label key={c} className={`fo${activeCat===c?' active':''}`} onClick={()=>setActiveCat(c)}>
                <input type="radio" name="cat" checked={activeCat===c} readOnly/><span>{c}</span>
              </label>
            ))}
          </div>
          <div className="fg">
            <div className="fg-title">Price Range</div>
            <DualRange value={priceRange} onChange={setPriceRange}/>
          </div>
          <div className="fg">
            <div className="fg-title">Material</div>
            {MATS.map(m=>(
              <label key={m} className="fo"><input type="checkbox" checked={activeMats.includes(m)} onChange={()=>toggleMat(m)}/><span>{m}</span></label>
            ))}
          </div>
          <div className="fg">
            <div className="fg-title">Availability</div>
            {AVAIL.map(v=>(
              <label key={v} className="fo"><input type="checkbox" checked={activeAvail.includes(v)} onChange={()=>toggleAvail(v)}/><span>{v}</span></label>
            ))}
          </div>
        </aside>
        <div className="shop-grid-area">
          {pills.length>0&&(
            <div className="filter-pills">
              {pills.map((pill,i)=>(
                <button key={i} className="fpill" onClick={pill.remove}>
                  {pill.label}<span className="fpill-x">×</span>
                </button>
              ))}
              <button className="fpill" onClick={()=>{setActiveCat('All');setPriceRange([0,35000]);setActiveMats([]);setActiveAvail([]);}}>
                Clear all<span className="fpill-x">×</span>
              </button>
            </div>
          )}
          <div className="shop-toolbar">
            <span className="shop-count">{filtered.length} objects</span>
            <select className="shop-sort" value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low–High</option>
              <option value="price_desc">Price: High–Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="shop-grid">
            {visible.map((p,i)=>(
              <ProductCard key={p.id} p={p} setPage={setPage} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} revealDelay={i%3}/>
            ))}
            {loading&&[0,1,2].map(i=>(
              <div key={i} style={{background:'var(--cream)'}}>
                <div className="skel-card skeleton"/>
                <div style={{padding:'20px 22px'}}>
                  <div className="skel-line skeleton" style={{width:'65%'}}/>
                  <div className="skel-line skeleton" style={{width:'40%'}}/>
                </div>
              </div>
            ))}
          </div>
          {visibleCount<filtered.length&&!loading&&(
            <div className="load-more-wrap">
              <button className="btn-p" onClick={loadMore}><span>Load More</span></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
function ProductPage({productId,setPage,addToCart,wishlist,toggleWish}){
  const p=P.find(x=>x.id===productId)||P[0];
  const [activeImg,setActiveImg]=useState(0);
  const [qty,setQty]=useState(1);
  const [adding,setAdding]=useState(false);
  const [lightbox,setLightbox]=useState(false);
  const [stickyVisible,setStickyVisible]=useState(false);
  const [qtyPulse,setQtyPulse]=useState(false);
  const addBtnRef=useRef(null);
  const wished=wishlist.includes(p.id);

  // Scroll progress
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    const h=()=>{
      const el=document.documentElement;
      const pct=el.scrollTop/(el.scrollHeight-el.clientHeight);
      setProgress(pct*100);
      setStickyVisible(addBtnRef.current&&addBtnRef.current.getBoundingClientRect().bottom<0);
    };
    window.addEventListener('scroll',h); return()=>window.removeEventListener('scroll',h);
  },[]);

  useScrollReveal();

  const handleAdd=()=>{ setAdding(true); Array.from({length:qty}).forEach(()=>addToCart(p)); setTimeout(()=>setAdding(false),1800); };
  const updateQty=(d)=>{ setQtyPulse(false); void setTimeout(()=>setQtyPulse(true),0); setQty(q=>Math.max(1,q+d)); };
  const nextImg=()=>setActiveImg(i=>(i+1)%p.imgs.length);
  const prevImg=()=>setActiveImg(i=>(i-1+p.imgs.length)%p.imgs.length);

  const handleToggleWish=(id,e)=>{ toggleWish(id,e); if(!wished&&e){ burstParticles(e.clientX,e.clientY); } };

  useEffect(()=>{ const h=e=>{ if(e.key==='ArrowRight')nextImg(); if(e.key==='ArrowLeft')prevImg(); if(e.key==='Escape')setLightbox(false); }; window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h); },[]);

  const related=P.filter(x=>x.id!==p.id&&x.cat===p.cat).slice(0,4);
  const ctlProd=P.filter(x=>x.id!==p.id).slice(0,3);
  const REVIEWS=[{author:"Priya S.",rating:5,body:"This piece transformed my living room. The material quality is extraordinary — exactly what the description promised.",verified:true,date:"Jan 2025"},{author:"Rohan M.",rating:4,body:"Beautiful craftsmanship. Ships very carefully packaged. Exactly as shown.",verified:true,date:"Dec 2024"}];

  return(
    <div className="pd-page page-wrap">
      <div className="scroll-progress" style={{width:progress+'%'}}/>

      {/* Floating wishlist */}
      <div className="pd-float-actions">
        <button className={`pd-float-btn${wished?' active':''}`} onClick={e=>handleToggleWish(p.id,e)} data-cursor={wished?"Saved":"Save"}>
          {wished?'♥':'♡'}
        </button>
        <button className="pd-float-btn" data-cursor="Share">↗</button>
      </div>

      <div className="pd-breadcrumb">
        <span onClick={()=>setPage('home')}>Home</span>
        <span style={{margin:'0 8px',opacity:.4}}>/</span>
        <span onClick={()=>setPage('shop')}>Shop</span>
        <span style={{margin:'0 8px',opacity:.4}}>/</span>
        <span onClick={()=>setPage('shop')}>{p.cat}</span>
        <span style={{margin:'0 8px',opacity:.4}}>/</span>
        <span style={{color:'var(--charcoal)'}}>{p.name}</span>
      </div>

      <div className="pd-layout">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-thumbs">
            {p.imgs.map((img,i)=>(
              <div key={i} className={`pd-thumb${activeImg===i?' active':''}`} onClick={()=>setActiveImg(i)}>
                <PV c1={img.c1} c2={img.c2} t={img.t} style={{width:'100%',height:'100%'}}/>
              </div>
            ))}
          </div>
          <div>
            <div className="pd-main-wrap" onClick={()=>setLightbox(true)} data-cursor="Zoom">
              <PV c1={p.imgs[activeImg].c1} c2={p.imgs[activeImg].c2} t={p.imgs[activeImg].t} style={{width:'100%',height:'100%'}}/>
              <div className="pd-img-nav">
                <button className="pd-nav-btn" onClick={e=>{e.stopPropagation();prevImg();}}>←</button>
                <button className="pd-nav-btn" onClick={e=>{e.stopPropagation();nextImg();}}>→</button>
              </div>
              <div className="pd-img-count">{activeImg+1} / {p.imgs.length}</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pd-info">
          <div className="pd-cat">{p.cat}</div>
          <h1 className="pd-title">{p.name}</h1>
          <div className="pd-sub">{p.sub}</div>
          <div className="pd-price"><span className="price-sym">₹</span>{p.price.toLocaleString('en-IN')}</div>
          <div className="pd-tax">Inclusive of all taxes · {p.price>=5000?'Free shipping':'Shipping ₹299'}</div>
          {p.stock>0&&p.stock<5&&<div style={{fontSize:11,color:'var(--terracotta)',marginBottom:16,letterSpacing:'.1em',textTransform:'uppercase'}}>Only {p.stock} left</div>}
          <p className="pd-desc">A considered object for the discerning interior. Crafted with attention to material honesty and quiet, enduring form. Works equally as a standalone accent or within a curated grouping.</p>
          <div className="pd-specs">
            {[["Material",p.mat],["Finish",p.finish],["Dimensions",p.dims],["Care",p.care],["Shipping",p.ship],["Origin",p.origin]].map(([l,v])=>(
              <div className="pd-spec" key={l}><span className="pd-spec-lbl">{l}</span><span className="pd-spec-val">{v}</span></div>
            ))}
          </div>
          <div className="pd-qty">
            <span className="pd-qty-lbl">Qty</span>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={()=>updateQty(-1)}>−</button>
              <span className={`qty-n${qtyPulse?' pulse':''}`}>{qty}</span>
              <button className="qty-btn" onClick={()=>updateQty(1)}>+</button>
            </div>
          </div>
          <div className="pd-actions" ref={addBtnRef}>
            <MagBtn dataCursor="Add" style={{flex:1}}>
              <button className={`pd-add-btn${adding?' adding':''}`} onClick={handleAdd} style={{width:'100%'}}>
                {adding?null:<span>Add to Cart</span>}
              </button>
            </MagBtn>
            <button className="pd-buy-btn" onClick={()=>setPage('payment')} data-cursor="Buy">Buy Now</button>
          </div>
          <div className="pd-ship-info">
            <div className="pd-ship-row"><span>📦</span><span>Ships in {p.ship}. Wrapped in archival tissue.</span></div>
            <div className="pd-ship-row"><span>↩</span><span>14-day returns on undamaged items.</span></div>
            <div className="pd-ship-row"><span>🔒</span><span>Secured by Razorpay · SSL encrypted.</span></div>
          </div>
          <div className="pd-trust">
            {["Authentic Materials","Artisan Made","Quality Assured","Insured Delivery"].map(t=>(
              <span key={t} className="pd-trust-item">✓ {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bar */}
      <div className={`sticky-purchase${stickyVisible?' visible':''}`}>
        <div style={{display:'flex',alignItems:'center'}}>
          <span className="sticky-prod-name">{p.name}</span>
          <span className="sticky-prod-price"> · <span className="price-sym">₹</span>{p.price.toLocaleString('en-IN')}</span>
        </div>
        <button className="sticky-add" onClick={handleAdd}>Add to Cart</button>
      </div>

      {/* Lightbox */}
      {lightbox&&(
        <div className="lightbox" onClick={()=>setLightbox(false)}>
          <button className="lightbox-close">×</button>
          <button className="lightbox-nav prev" onClick={e=>{e.stopPropagation();prevImg();}}>←</button>
          <div className="lightbox-img" style={{width:'50vw',height:'70vh'}} onClick={e=>e.stopPropagation()}>
            <PV c1={p.imgs[activeImg].c1} c2={p.imgs[activeImg].c2} t={p.imgs[activeImg].t} style={{width:'100%',height:'100%'}}/>
          </div>
          <button className="lightbox-nav next" onClick={e=>{e.stopPropagation();nextImg();}}>→</button>
        </div>
      )}

      {/* Reviews */}
      <div className="reviews-section">
        <div className="sec-hdr"><h2 className="sec-title">Reviews ({REVIEWS.length})</h2></div>
        {REVIEWS.map((r,i)=>(
          <div className="review-card" key={i}>
            <div>
              <div className="review-author">{r.author}</div>
              <Stars rating={r.rating}/>
              <div className="review-date">{r.date}</div>
              {r.verified&&<div className="review-verified">✓ Verified Purchase</div>}
            </div>
            <p className="review-body">{r.body}</p>
          </div>
        ))}
        <div className="review-form" style={{marginTop:40}}>
          <div style={{fontSize:10,letterSpacing:'.28em',textTransform:'uppercase',color:'var(--taupe)',marginBottom:20}}>Write a Review</div>
          <div style={{marginBottom:16}}><Stars rating={0}/></div>
          <textarea placeholder="Share your experience with this piece..." maxLength={500}/>
          <div className="char-count">0 / 500</div>
          <button className="btn-p" style={{marginTop:16}}><span>Submit Review</span></button>
        </div>
      </div>

      {/* Provenance */}
      <div className="provenance">
        <div>
          <span className="eyebrow">Provenance</span>
          <h3 className="prov-block-title">{p.maker}</h3>
          <p className="prov-text">Based in {p.origin}, {p.maker} works with traditional techniques passed down across generations. Each piece is produced in small runs, ensuring consistency of quality and care that mass production cannot replicate.</p>
        </div>
        <div>
          <span className="eyebrow">Material Origin</span>
          <h3 className="prov-block-title">{p.mat}</h3>
          <p className="prov-text">Sourced sustainably from verified regional suppliers. The material's natural variation — in tone, texture, and surface — is considered a feature of the work, not a flaw. No two pieces are identical.</p>
        </div>
      </div>

      {/* Complete the look */}
      <div className="ctl-section">
        <span className="eyebrow">Complete the Look</span>
        <RevealText className="sec-title" tag="h2">Objects that work alongside it</RevealText>
        <div className="ctl-grid">
          {ctlProd.map((rp,i)=>(
            <ProductCard key={rp.id} p={rp} setPage={setPage} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} revealDelay={i}/>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="products-section" style={{borderTop:'1px solid var(--sand)'}}>
        <div className="sec-hdr">
          <RevealText className="sec-title" tag="h2">More from {p.cat}</RevealText>
          <span className="sec-link" onClick={()=>setPage('shop')}>View all →</span>
        </div>
        <div className="products-grid">
          {related.map((rp,i)=>(
            <ProductCard key={rp.id} p={rp} setPage={setPage} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} revealDelay={i}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT PAGE
// ═══════════════════════════════════════════════════════════════
function PaymentPage({cart,setPage}){
  const [step,setStep]=useState(1);
  const [method,setMethod]=useState('card');
  const [isGift,setIsGift]=useState(false);
  const [giftMsg,setGiftMsg]=useState('');
  const [giftWrap,setGiftWrap]=useState(false);

  const subtotal=cart.reduce((s,i)=>s+i.price*(i.qty||1),0);
  const shipping=subtotal>=5000?0:299;
  const wrapping=isGift&&giftWrap?199:0;
  const total=subtotal+shipping+wrapping;

  if(step===3) return(
    <div className="order-success page-wrap">
      <div>
        <div className="success-icon">{isGift?'🎁':'✓'}</div>
        <h1 className="success-title">{isGift?'Gift Confirmed':'Order Confirmed'}</h1>
        <div className="success-order">Order #GG-{Math.floor(Math.random()*90000+10000)}</div>
        <p className="success-sub">
          {isGift
            ? 'Your gift is being prepared with care. The packing slip will not include prices. A confirmation has been sent to your email.'
            : 'Thank you for your purchase. You\'ll receive a confirmation shortly. Your objects will be packed with care.'}
        </p>
        <MagBtn onClick={()=>setPage('home')} dataCursor="Explore">
          <button className="btn-p"><span>Continue Exploring</span></button>
        </MagBtn>
      </div>
    </div>
  );

  return(
    <div className="payment-wrap page-wrap">
      <div className="payment-layout">
        <div className="payment-left">
          <h1 className="payment-title">{step===1?'Your Details':step===2?'Gifting':'Payment'}</h1>

          {step===1&&(
            <>
              <div style={{marginBottom:36}}>
                <div className="fsec-title">Contact</div>
                <div className="form-row"><div className="form-g"><label className="form-lbl">First Name</label><input className="form-inp" placeholder="Aryan"/></div><div className="form-g"><label className="form-lbl">Last Name</label><input className="form-inp" placeholder="Mehta"/></div></div>
                <div className="form-row full"><div className="form-g"><label className="form-lbl">Email</label><input className="form-inp" type="email" placeholder="aryan@example.com"/></div></div>
                <div className="form-row full"><div className="form-g"><label className="form-lbl">Phone</label><input className="form-inp" placeholder="+91 98765 43210"/></div></div>
              </div>
              <div style={{marginBottom:36}}>
                <div className="fsec-title">Shipping Address</div>
                <div className="form-row full"><div className="form-g"><label className="form-lbl">Address</label><input className="form-inp" placeholder="123 Marine Lines"/></div></div>
                <div className="form-row"><div className="form-g"><label className="form-lbl">City</label><input className="form-inp" placeholder="Mumbai"/></div><div className="form-g"><label className="form-lbl">Pincode</label><input className="form-inp" placeholder="400001"/></div></div>
                <div className="form-row full"><div className="form-g"><label className="form-lbl">State</label><input className="form-inp" placeholder="Maharashtra"/></div></div>
              </div>
              <button className="payment-submit" onClick={()=>setStep(2)}>Continue →</button>
            </>
          )}

          {step===2&&(
            <>
              <div className="gift-toggle-wrap">
                <span className="gift-toggle-lbl">Is this a gift?</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={isGift} onChange={e=>setIsGift(e.target.checked)}/>
                  <div className="toggle-track"/>
                  <div className="toggle-thumb"/>
                </label>
              </div>
              {isGift&&(
                <div className="gift-options">
                  <div className="form-g" style={{marginBottom:16}}>
                    <label className="form-lbl">Gift Message (optional)</label>
                    <textarea className="form-inp" placeholder="Write a personal message..." value={giftMsg} onChange={e=>setGiftMsg(e.target.value.slice(0,160))} style={{resize:'none',minHeight:80,paddingTop:12}}/>
                    <div className="char-count">{giftMsg.length} / 160</div>
                  </div>
                  <label className="fo">
                    <input type="checkbox" checked={giftWrap} onChange={e=>setGiftWrap(e.target.checked)}/>
                    <span>Gift wrapping (+₹199)</span>
                  </label>
                  <p style={{fontSize:11,color:'var(--muted)',marginTop:12}}>Prices will be hidden on the packing slip.</p>
                </div>
              )}
              <button className="payment-submit" onClick={()=>setStep(3)}>Continue to Payment →</button>
              <button style={{width:'100%',background:'none',border:'none',cursor:'pointer',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--muted)',marginTop:12,padding:12}} onClick={()=>setStep(1)}>← Back</button>
            </>
          )}

          {step===3&&null}
        </div>

        <div className="payment-right">
          <div className="order-sum-title">Order Summary</div>
          {cart.map((item,i)=>(
            <div className="order-item" key={i}>
              <div className="order-item-img"><PV c1={item.imgs[0].c1} c2={item.imgs[0].c2} t={item.imgs[0].t} style={{width:'100%',height:'100%'}}/></div>
              <div><div className="order-item-name">{item.name}</div><div className="order-item-meta">{item.mat} · Qty {item.qty||1}</div></div>
              <div className="order-item-price"><span className="price-sym">₹</span>{(item.price*(item.qty||1)).toLocaleString('en-IN')}</div>
            </div>
          ))}
          <div className="order-totals">
            <div className="order-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="order-row"><span>Shipping</span><span>{shipping===0?'Free':'₹'+shipping}</span></div>
            {wrapping>0&&<div className="order-row"><span>Gift Wrapping</span><span>₹{wrapping}</span></div>}
            <div className="order-grand"><span className="order-grand-lbl">Total</span><span className="order-grand-val"><span className="price-sym">₹</span>{total.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="secure-note">🔒 <span>Secured by Razorpay · 256-bit SSL</span></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// JOURNAL PAGE
// ═══════════════════════════════════════════════════════════════
function JournalPage({setPage,addToCart}){
  return(
    <div className="page-wrap">
      <div className="journal-hero">
        <span className="eyebrow">The Journal</span>
        <RevealText className="journal-hero-title" tag="h1">Objects, spaces,<br/>and the way we live.</RevealText>
      </div>
      <div className="journal-grid">
        {ARTICLES.map((a,i)=>(
          <div key={a.slug} className={`journal-card reveal-scale${i===0?' journal-hero-card hero-card':''}`} onClick={()=>setPage('article-'+a.slug)}>
            <div className="journal-card-img">
              <div className="journal-card-img-inner">
                <PV c1={a.c1} c2={a.c2} t={i*2} style={{width:'100%',height:'100%'}}/>
              </div>
            </div>
            <div className="journal-card-info">
              <div className="journal-card-cat">{a.cat}</div>
              <div className="journal-card-title">{a.title}</div>
              <p className="journal-card-sub">{a.subtitle}</p>
              <div className="journal-card-meta">{a.readTime} read</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ARTICLE PAGE
// ═══════════════════════════════════════════════════════════════
function ArticlePage({slug,setPage,addToCart}){
  const a=ARTICLES.find(x=>x.slug===slug)||ARTICLES[0];
  const [progress,setProgress]=useState(0);
  const [stickyHdr,setStickyHdr]=useState(false);

  useEffect(()=>{
    const h=()=>{
      const el=document.documentElement;
      const p=el.scrollTop/(el.scrollHeight-el.clientHeight);
      setProgress(p*100);
      setStickyHdr(el.scrollTop>200);
    };
    window.addEventListener('scroll',h); return()=>window.removeEventListener('scroll',h);
  },[]);

  const featuredProds=P.filter(x=>a.featuredProducts.includes(x.id));
  // Insert inline product cards at 2nd and 4th paragraph
  const bodyWithCards=a.body.reduce((acc,para,i)=>{
    acc.push(para);
    if(i===1&&featuredProds[0]) acc.push({__product:featuredProds[0]});
    if(i===3&&featuredProds[1]) acc.push({__product:featuredProds[1]});
    return acc;
  },[]);

  return(
    <div className="page-wrap">
      <div className="article-progress" style={{width:progress+'%'}}/>
      <div className={`article-sticky-hdr${stickyHdr?' visible':''}`}>
        <span className="article-sticky-title">{a.title}</span>
        <span className="article-sticky-read">{a.readTime} read</span>
      </div>
      <div className="article-hero">
        <span className="eyebrow">{a.cat}</span>
        <h1 className="article-hero-title">{a.title}</h1>
        <p className="article-hero-sub">{a.subtitle}</p>
        <div className="article-hero-meta">{a.readTime} read · Ghar & Grace Journal</div>
      </div>
      <div style={{padding:'0 80px 40px',maxWidth:1000}}>
        <PV c1={a.c1} c2={a.c2} t={1} style={{width:'100%',height:320}}/>
      </div>
      <div className="article-body">
        <div className="journal-body">
          {bodyWithCards.map((item,i)=>{
            if(item.__product){
              const pp=item.__product;
              return(
                <div className="inline-product-card" key={i} onClick={()=>setPage('product-'+pp.id)}>
                  <div className="inline-product-img"><PV c1={pp.imgs[0].c1} c2={pp.imgs[0].c2} t={pp.imgs[0].t} style={{width:'100%',height:'100%'}}/></div>
                  <div style={{flex:1}}>
                    <div className="inline-product-name">{pp.name}</div>
                    <div className="inline-product-meta">{pp.mat} · {pp.cat}</div>
                    <div style={{display:'flex',alignItems:'center',gap:16}}>
                      <span className="inline-product-price"><span className="price-sym">₹</span>{pp.price.toLocaleString('en-IN')}</span>
                      <button className="inline-add" onClick={e=>{e.stopPropagation();addToCart(pp);}}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              );
            }
            if(i===Math.floor(bodyWithCards.length/2)){
              return(
                <div key={i}>
                  <div className="pull-quote">"The emptiness around an object is not an absence — it is an active presence."</div>
                  <p>{item}</p>
                </div>
              );
            }
            return <p key={i}>{item}</p>;
          })}
        </div>
        <div style={{padding:'48px 0',borderTop:'1px solid var(--sand)',marginTop:40}}>
          <span className="eyebrow">Featured Objects</span>
          {featuredProds.map(pp=>(
            <div className="inline-product-card" key={pp.id} onClick={()=>setPage('product-'+pp.id)}>
              <div className="inline-product-img"><PV c1={pp.imgs[0].c1} c2={pp.imgs[0].c2} t={pp.imgs[0].t} style={{width:'100%',height:'100%'}}/></div>
              <div style={{flex:1}}>
                <div className="inline-product-name">{pp.name}</div>
                <div className="inline-product-meta">{pp.mat}</div>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <span className="inline-product-price"><span className="price-sym">₹</span>{pp.price.toLocaleString('en-IN')}</span>
                  <button className="inline-add" onClick={e=>{e.stopPropagation();addToCart(pp);}}>Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ABOUT PAGE
// ═══════════════════════════════════════════════════════════════
function AboutPage(){
  useScrollReveal();
  return(
    <div className="page-wrap">
      <div className="about-hero">
        <span className="eyebrow reveal-fade">The Studio</span>
        <RevealText className="about-h1" tag="h1" delay={50}>Elevating everyday spaces.</RevealText>
      </div>
      <div className="about-split">
        <div>
          <h2 className="about-block-h reveal-fade">Why Ghar & Grace exists</h2>
          <div className="about-block-p">
            <p className="reveal-fade">We started with a simple observation: the most beautiful interiors aren't defined by expense — they're defined by intention.</p>
            <p className="reveal-fade" style={{transitionDelay:'.12s'}}>India has a rich tradition of craft and material culture. We exist to connect that tradition with a contemporary design sensibility.</p>
          </div>
        </div>
        <div>
          <h2 className="about-block-h reveal-fade">What "Elevating Everyday" means</h2>
          <div className="about-block-p">
            <p className="reveal-fade">It doesn't mean expensive. It means considered. A ceramic vessel placed thoughtfully. A wall piece that holds silence rather than filling it.</p>
            <p className="reveal-fade" style={{transitionDelay:'.12s'}}>We select every piece against one question: will this still feel right in ten years?</p>
          </div>
        </div>
      </div>
      <div className="about-principles">
        {[["01","Material Integrity","We work only with natural materials — stone, fired clay, raw wood, woven fibre."],["02","Quiet Confidence","Good design doesn't announce itself. It settles into a room and makes everything better."],["03","Considered Curation","Fewer than ten new pieces each season. Each one lived with before it joins the collection."]].map(([n,h,p])=>(
          <div className="principle reveal-scale" key={n}>
            <div className="principle-n">{n}</div>
            <div className="principle-h">{h}</div>
            <div className="principle-p">{p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WISHLIST PAGE
// ═══════════════════════════════════════════════════════════════
function WishlistPage({wishlist,toggleWish,setPage,addToCart}){
  useScrollReveal();
  const wished=P.filter(p=>wishlist.includes(p.id));
  return(
    <div className="page-wrap">
      <div className="wish-hero">
        <span className="eyebrow">Saved</span>
        <h1 className="wish-title">Wishlist</h1>
      </div>
      {wished.length===0?(
        <div style={{textAlign:'center',padding:'80px',color:'var(--muted)'}}>
          <div style={{fontSize:40,marginBottom:16}}>♡</div>
          <div style={{fontFamily:'var(--serif)',fontSize:28,marginBottom:8}}>Nothing saved yet.</div>
          <div style={{fontSize:13,marginBottom:32}}>Browse the collection and save pieces you love.</div>
          <button className="btn-p" onClick={()=>setPage('shop')}><span>Explore Collection</span></button>
        </div>
      ):(
        <div className="products-section">
          <div className="products-grid">
            {wished.map((p,i)=>(
              <ProductCard key={p.id} p={p} setPage={setPage} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} revealDelay={i}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CRM DASHBOARD
// ═══════════════════════════════════════════════════════════════
const MONTHS=['Aug','Sep','Oct','Nov','Dec','Jan','Feb'];
const REV=[38,52,44,68,72,89,94];

function CRMDash({setPage}){
  const [crmPage,setCrmPage]=useState('overview');
  const [orderFilter,setOrderFilter]=useState('all');
  const [editingStock,setEditingStock]=useState({});

  const nav=[{icon:'📊',label:'Overview',key:'overview'},{icon:'📦',label:'Orders',key:'orders'},{icon:'👥',label:'Customers',key:'customers'},{icon:'🗃',label:'Inventory',key:'inventory'},{icon:'📈',label:'Analytics',key:'analytics'}];

  const setStock=(id,v)=>setEditingStock(s=>({...s,[id]:v}));

  return(
    <div className="crm-wrap">
      <div className="crm-sidebar">
        <div className="crm-logo">
          <div className="crm-logo-name">Ghar <em>& Grace</em></div>
          <div className="crm-logo-sub">Studio Dashboard</div>
        </div>
        <nav className="crm-nav">
          <div className="crm-nav-grp">Main</div>
          {nav.map(n=>(
            <div key={n.key} className={`crm-nav-item${crmPage===n.key?' active':''}`} onClick={()=>setCrmPage(n.key)}>
              <span style={{fontSize:16,width:20,textAlign:'center'}}>{n.icon}</span>{n.label}
            </div>
          ))}
          <div className="crm-nav-grp" style={{marginTop:16}}>Settings</div>
          <div className="crm-nav-item"><span style={{fontSize:16,width:20,textAlign:'center'}}>⚙</span>Settings</div>
          <div className="crm-nav-item" onClick={()=>setPage('home')}><span style={{fontSize:16,width:20,textAlign:'center'}}>←</span>Back to Store</div>
        </nav>
      </div>
      <div className="crm-main">
        <div className="crm-topbar">
          <h1 className="crm-page-title">{nav.find(n=>n.key===crmPage)?.label}</h1>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <input className="crm-search" placeholder="Search…"/>
            <span style={{fontSize:13,color:'var(--muted)'}}>March 2025</span>
          </div>
        </div>
        <div className="crm-body">
          {crmPage==='overview'&&<CRMOverview/>}
          {crmPage==='orders'&&<CRMOrders filter={orderFilter} setFilter={setOrderFilter}/>}
          {crmPage==='customers'&&<CRMCustomers/>}
          {crmPage==='inventory'&&<CRMInventory editingStock={editingStock} setStock={setStock}/>}
          {crmPage==='analytics'&&<CRMAnalytics/>}
        </div>
      </div>
    </div>
  );
}

function CRMOverview(){
  return(
    <>
      <div className="crm-cards">
        {[["Revenue","₹4,82,600","↑ 18% vs last month","up"],["Orders","127","↑ 24 this month","up"],["Avg Order Value","₹3,800","↑ ₹420 vs last","up"],["Customers","312","↑ 28 this month","up"]].map(([l,v,c,d])=>(
          <div className="crm-card" key={l}><div className="crm-card-lbl">{l}</div><div className="crm-card-val">{v}</div><div className={`crm-card-chg ${d}`}>{c}</div></div>
        ))}
      </div>
      <div className="crm-two-col">
        <div className="crm-panel">
          <div className="crm-panel-title">Monthly Revenue</div>
          <div className="crm-chart">
            {MONTHS.map((m,i)=>(
              <div className="crm-bar-grp" key={m}>
                <div className="crm-bar" style={{height:`${(REV[i]/100)*148}px`,animationDelay:`${i*80}ms`}}/>
                <div className="crm-bar-lbl">{m}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="crm-panel">
          <div className="crm-panel-title">Top Products</div>
          {P.slice(0,5).map((p,i)=>(
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div style={{width:40,height:52,flexShrink:0}}>
                <PV c1={p.imgs[0].c1} c2={p.imgs[0].c2} t={p.imgs[0].t} style={{width:'100%',height:'100%'}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>{12-i*2} sold</div>
                <div style={{height:3,background:'#E8E4DF'}}><div style={{height:'100%',width:`${100-i*18}%`,background:'linear-gradient(to right,var(--taupe),var(--muted))'}}/></div>
              </div>
              <div style={{fontSize:13,fontWeight:400,whiteSpace:'nowrap',marginLeft:8}}>₹{((12-i*2)*p.price).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="crm-panel">
        <div className="crm-panel-title">Recent Orders</div>
        <table className="crm-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {CRM_ORDERS.slice(0,5).map(o=>(
              <tr key={o.id}>
                <td style={{fontWeight:500}}>{o.id}</td><td>{o.customer}</td>
                <td style={{color:'var(--muted)'}}>{o.product}</td>
                <td>₹{o.amount.toLocaleString('en-IN')}</td>
                <td><span className={`crm-status ${o.status}`}>{o.status}</span></td>
                <td style={{color:'var(--muted)'}}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CRMOrders({filter,setFilter}){
  const [stocks,setStocks]=useState({});
  const tabs=[['all','All'],['paid','Paid'],['shipped','Shipped'],['pending','Pending'],['cancelled','Cancelled']];
  const filtered=filter==='all'?CRM_ORDERS:CRM_ORDERS.filter(o=>o.status===filter);
  return(
    <div className="crm-panel">
      <div className="crm-tabs">
        {tabs.map(([k,l])=>(
          <div key={k} className={`crm-tab${filter===k?' active':''}`} onClick={()=>setFilter(k)}>
            {l}<span className="crm-badge">{k==='all'?CRM_ORDERS.length:CRM_ORDERS.filter(o=>o.status===k).length}</span>
          </div>
        ))}
      </div>
      <table className="crm-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {filtered.map(o=>(
            <tr key={o.id}>
              <td style={{fontWeight:500}}>{o.id}</td><td>{o.customer}</td>
              <td style={{color:'var(--muted)'}}>{o.product}</td>
              <td>₹{o.amount.toLocaleString('en-IN')}</td>
              <td>
                <select className="crm-status" style={{cursor:'pointer',border:'none',outline:'none',background:'transparent'}}
                  value={o.status}
                  onChange={()=>{}}>
                  {['pending','confirmed','paid','shipped','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}
                </select>
              </td>
              <td style={{color:'var(--muted)'}}>{o.date}</td>
              <td><button style={{background:'none',border:'1px solid #E8E4DF',padding:'4px 12px',fontSize:11,cursor:'pointer',letterSpacing:'.1em'}}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CRMCustomers(){
  const custs=[{n:"Priya Sharma",e:"priya@example.com",orders:8,spent:"₹94,200",since:"Jan 2023"},{n:"Rohan Mehta",e:"rohan@example.com",orders:5,spent:"₹62,800",since:"Mar 2023"},{n:"Ananya Singh",e:"ananya@example.com",orders:12,spent:"₹1,38,500",since:"Nov 2022"},{n:"Karan Joshi",e:"karan@example.com",orders:3,spent:"₹41,200",since:"Aug 2023"},{n:"Meera Pillai",e:"meera@example.com",orders:7,spent:"₹88,400",since:"Jan 2023"},{n:"Arjun Nair",e:"arjun@example.com",orders:2,spent:"₹18,700",since:"Dec 2023"}];
  return(
    <>
      <div className="crm-cards" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        {[["Total","312","↑ 28 this month","up"],["Repeat Rate","68%","↑ 4%","up"],["Avg LTV","₹52,400","↑ ₹3,200","up"]].map(([l,v,c,d])=>(
          <div className="crm-card" key={l}><div className="crm-card-lbl">{l}</div><div className="crm-card-val">{v}</div><div className={`crm-card-chg ${d}`}>{c}</div></div>
        ))}
      </div>
      <div className="crm-panel">
        <div className="crm-panel-title">Customer Directory</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {custs.map(c=>(
            <div key={c.e} style={{background:'#FAFAF8',border:'1px solid #E8E4DF',padding:20,display:'flex',gap:16}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--taupe),var(--muted))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--serif)',fontSize:18,color:'white',flexShrink:0}}>
                {c.n[0]}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{c.n}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8}}>{c.e}</div>
                <div style={{display:'flex',gap:16,fontSize:11,color:'var(--muted)'}}>
                  <span>Orders: <strong style={{color:'var(--charcoal)'}}>{c.orders}</strong></span>
                  <span>LTV: <strong style={{color:'var(--charcoal)'}}>{c.spent}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CRMInventory({editingStock,setStock}){
  return(
    <>
      <div className="crm-cards">
        {[["Total SKUs","33","Active",""],["Low Stock","4","Below 5 units","dn"],["Out of Stock","1","Needs restock","dn"],["Total Value","₹18.4L","Current inventory","up"]].map(([l,v,c,d])=>(
          <div className="crm-card" key={l}><div className="crm-card-lbl">{l}</div><div className="crm-card-val">{v}</div><div className={`crm-card-chg${d?' '+d:''}`} style={{color:d==='dn'?'#8C5A5A':d==='up'?'#5A8C6A':'var(--muted)'}}>{c}</div></div>
        ))}
      </div>
      <div className="crm-inv-grid">
        {P.slice(0,12).map(p=>{
          const stock=editingStock[p.id]!==undefined?editingStock[p.id]:p.stock;
          const pct=Math.min(100,(stock/20)*100);
          const color=stock===0?'#9C9C9C':stock<5?'#C47A7A':pct>60?'var(--taupe)':'#C4A84A';
          return(
            <div className="crm-inv-card" key={p.id}>
              <div className="crm-inv-sku">SKU-GG-{String(p.id).padStart(3,'0')}</div>
              <div className="crm-inv-name">{p.name}</div>
              <div className="crm-inv-bar"><div className="crm-inv-fill" style={{width:pct+'%',background:color}}/></div>
              <div className="crm-inv-meta">
                <span>
                  <input className="crm-inline-edit" type="number" value={stock}
                    onChange={e=>setStock(p.id,parseInt(e.target.value)||0)}
                    onBlur={()=>{}} min={0}/>
                  {' '}in stock
                </span>
                <span>₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function CRMAnalytics(){
  return(
    <>
      <div className="crm-cards">
        {[["Page Views","48,240","↑ 22%","up"],["Conversion","3.8%","↑ 0.4%","up"],["Bounce Rate","42%","↓ 3%","up"],["Avg Session","4m 12s","↑ 0:38","up"]].map(([l,v,c,d])=>(
          <div className="crm-card" key={l}><div className="crm-card-lbl">{l}</div><div className="crm-card-val">{v}</div><div className={`crm-card-chg ${d}`}>{c}</div></div>
        ))}
      </div>
      <div className="crm-two-col">
        <div className="crm-panel">
          <div className="crm-panel-title">Revenue by Category</div>
          {CATS.map((c,i)=>{
            const pct=[38,24,18,12,8][i];
            return(
              <div key={c} style={{marginBottom:18}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}><span>{c}</span><span style={{color:'var(--muted)'}}>{pct}%</span></div>
                <div style={{height:5,background:'#E8E4DF',borderRadius:3}}><div style={{height:'100%',width:pct+'%',background:'linear-gradient(to right,var(--taupe),var(--muted))',borderRadius:3,transition:'width 1s var(--ease-out)'}}/></div>
              </div>
            );
          })}
        </div>
        <div className="crm-panel">
          <div className="crm-panel-title">Traffic Sources</div>
          {[["Direct","38%"],["Instagram","28%"],["Google","18%"],["Referral","10%"],["Other","6%"]].map(([s,p])=>(
            <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:'1px solid #F4F2EF',fontSize:13}}>
              <span>{s}</span><span style={{fontWeight:500}}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const [page,setPage]=useState('home');
  const [cart,setCart]=useState([]);
  const [wishlist,setWishlist]=useState([]);
  const [cartOpen,setCartOpen]=useState(false);
  const [toast,setToast]=useState(null);

  const go=useCallback((p)=>{ setPage(p); setCartOpen(false); window.scrollTo(0,0); },[]);

  const addToCart=useCallback((p)=>{
    setCart(c=>{
      const idx=c.findIndex(i=>i.id===p.id);
      if(idx>=0){ return c.map((item,i)=>i===idx?{...item,qty:item.qty+1}:item); }
      return [...c,{...p,qty:1}];
    });
    setToast(p.name+' added to cart');
    setTimeout(()=>setToast(null),2800);
  },[]);

  const toggleWish=useCallback((id,e)=>{
    setWishlist(w=>{ const had=w.includes(id); if(!had&&e){ burstParticles(e.clientX,e.clientY); } return had?w.filter(x=>x!==id):[...w,id]; });
  },[]);

  const productId=page.startsWith('product-')?parseInt(page.split('-')[1]):null;
  const articleSlug=page.startsWith('article-')?page.slice(8):null;
  const isCRM=page==='crm';
  const cartTotal=cart.reduce((s,i)=>s+(i.qty||1),0);

  return(
    <>
      <style>{CSS}</style>
      <Cursor/>
      <Nav page={page} setPage={go} cartCount={cartTotal} onCartOpen={()=>setCartOpen(true)} isCRM={isCRM}/>
      <CartDrawer open={cartOpen} onClose={()=>setCartOpen(false)} cart={cart} setCart={setCart} setPage={go}/>
      <Toast msg={toast}/>
      {!isCRM&&<AmbientSound isCRM={isCRM}/>}

      <PageTransition pageKey={page}>
        {page==='home'&&<HomePage setPage={go} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}
        {page==='shop'&&<ShopPage setPage={go} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}
        {page==='about'&&<AboutPage/>}
        {page==='wishlist'&&<WishlistPage wishlist={wishlist} toggleWish={toggleWish} setPage={go} addToCart={addToCart}/>}
        {page==='payment'&&<PaymentPage cart={cart} setPage={go}/>}
        {page==='journal'&&<JournalPage setPage={go} addToCart={addToCart}/>}
        {page==='crm'&&<CRMDash setPage={go}/>}
        {productId&&<ProductPage productId={productId} setPage={go} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}
        {articleSlug&&<ArticlePage slug={articleSlug} setPage={go} addToCart={addToCart}/>}
      </PageTransition>
    </>
  );
}

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useLangStore } from '../stores/lang'

const langStore = useLangStore()

const isSr = computed(() => langStore.currentLang === 'sr')

/** Unsplash — free to use per site license; swap for your own Goč photos when ready. */
const heroBg =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80'
const imgDiscoverA =
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80'
const imgDiscoverB =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80'
const imgCard1 =
  'https://images.unsplash.com/photo-1511497584787-3a6bc4763523?auto=format&fit=crop&w=800&q=80'
const imgCard2 =
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
const imgCard3 =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
const imgNewsMain =
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'
/** Thumbs for the news “rail” (reuse curated shots). */
const imgNewsRail = [
  'https://images.unsplash.com/photo-1511497584787-3a6bc4763523?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
]
/** Extra slides for discover carousel — each URL unique so every tile shows a distinct photo. */
const imgSlideForestSun =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80'
const imgSlideRiver =
  'https://images.unsplash.com/photo-1426604966848-d7adac402fdd?auto=format&fit=crop&w=900&q=80'
const imgSlideTrail =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'
const imgSlideMeadow =
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80'

/** Demo quick-link tiles — replace with CMS-driven list when you have 6+ destinations. */
const discoverQuickLinks = computed(() => {
  const sr = isSr.value
  return [
    {
      to: '/smestaj',
      img: imgDiscoverA,
      title: sr ? 'Смештај на Гочу' : 'Stays at Goč',
      dek: sr ? 'Капацитети и резервације' : 'Capacity & bookings',
    },
    {
      to: '/vesti',
      img: imgDiscoverB,
      title: sr ? 'Вести и обавештења' : 'News & notices',
      dek: sr ? 'Догађаји и ажурирања' : 'Events & updates',
    },
    {
      to: '/prijava',
      img: imgCard1,
      title: sr ? 'Пријава гостију' : 'Guest sign-in',
      dek: sr ? 'Налог и резервације' : 'Account & reservations',
    },
    {
      to: '/',
      img: imgSlideForestSun,
      title: sr ? 'Главни сајт' : 'Main site',
      dek: sr ? 'Почетна и садржај' : 'Home & content',
    },
    {
      to: '/landing',
      img: imgSlideRiver,
      title: sr ? 'Нови изглед (демо)' : 'New look (demo)',
      dek: sr ? 'Страница /landing' : 'This /landing preview',
    },
    {
      to: '/vesti',
      img: imgSlideTrail,
      title: sr ? 'Све вести' : 'All news',
      dek: sr ? 'Листа објава' : 'Post listing',
    },
    {
      external: true,
      href: 'https://www.sfb.bg.ac.rs/',
      img: imgSlideMeadow,
      title: sr ? 'Шумарски факултет' : 'Faculty of Forestry',
      dek: sr ? 'Званичан сајт' : 'Official website',
    },
  ]
})

const discoverIndex = ref(0)
const discoverTouchX0 = ref(0)
const discoverMosaicEl = ref(null)
/** Hover, keyboard focus inside carousel, or post-touch cooldown. */
const discoverAutoplayHeld = ref(false)
let discoverAutoplayTimerId = null
const DISCOVER_AUTOPLAY_MS = 5500
let discoverTouchResumeTimerId = null

const discoverTrackStyle = computed(() => {
  const n = discoverQuickLinks.value.length
  if (!n) return {}
  const i = discoverIndex.value
  return {
    width: `${n * 100}%`,
    transform: `translateX(calc(-${i} * (100% / ${n})))`,
  }
})

function discoverClearAutoplay() {
  if (discoverAutoplayTimerId != null) {
    clearInterval(discoverAutoplayTimerId)
    discoverAutoplayTimerId = null
  }
}

function discoverSyncAutoplay() {
  discoverClearAutoplay()
  if (discoverAutoplayHeld.value) return
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  const n = discoverQuickLinks.value.length
  if (n < 2) return
  discoverAutoplayTimerId = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    if (discoverAutoplayHeld.value) return
    discoverNext({ fromAutoplay: true })
  }, DISCOVER_AUTOPLAY_MS)
}

function discoverBumpAutoplay() {
  discoverSyncAutoplay()
}

function discoverPrev(opts = {}) {
  const n = discoverQuickLinks.value.length
  if (!n) return
  discoverIndex.value = (discoverIndex.value - 1 + n) % n
  if (!opts.fromAutoplay && !opts.fromSwipe) discoverBumpAutoplay()
}

function discoverNext(opts = {}) {
  const n = discoverQuickLinks.value.length
  if (!n) return
  discoverIndex.value = (discoverIndex.value + 1) % n
  if (!opts.fromAutoplay && !opts.fromSwipe) discoverBumpAutoplay()
}

function discoverGoTo(idx) {
  const n = discoverQuickLinks.value.length
  if (idx >= 0 && idx < n) discoverIndex.value = idx
  discoverBumpAutoplay()
}

function onDiscoverMosaicEnter() {
  discoverAutoplayHeld.value = true
  discoverClearAutoplay()
}

function onDiscoverMosaicLeave() {
  discoverAutoplayHeld.value = false
  discoverSyncAutoplay()
}

function onDiscoverMosaicFocusIn() {
  discoverAutoplayHeld.value = true
  discoverClearAutoplay()
}

function onDiscoverMosaicFocusOut() {
  requestAnimationFrame(() => {
    const root = discoverMosaicEl.value
    if (root && root.contains(document.activeElement)) return
    discoverAutoplayHeld.value = false
    discoverSyncAutoplay()
  })
}

function onDiscoverTouchStart(e) {
  discoverTouchX0.value = e.changedTouches[0]?.screenX ?? 0
  discoverAutoplayHeld.value = true
  discoverClearAutoplay()
  if (discoverTouchResumeTimerId != null) {
    clearTimeout(discoverTouchResumeTimerId)
    discoverTouchResumeTimerId = null
  }
}

function onDiscoverTouchEnd(e) {
  const x = e.changedTouches[0]?.screenX ?? discoverTouchX0.value
  const d = x - discoverTouchX0.value
  if (d < -48) discoverNext({ fromSwipe: true })
  else if (d > 48) discoverPrev({ fromSwipe: true })
  if (discoverTouchResumeTimerId != null) clearTimeout(discoverTouchResumeTimerId)
  discoverTouchResumeTimerId = window.setTimeout(() => {
    discoverTouchResumeTimerId = null
    discoverAutoplayHeld.value = false
    discoverSyncAutoplay()
  }, 1400)
}

function onDiscoverVisibility() {
  discoverSyncAutoplay()
}

let robotsMetaEl = null
onMounted(() => {
  robotsMetaEl = document.createElement('meta')
  robotsMetaEl.name = 'robots'
  robotsMetaEl.content = 'noindex, nofollow'
  document.head.appendChild(robotsMetaEl)

  document.addEventListener('visibilitychange', onDiscoverVisibility)
  discoverSyncAutoplay()
})

onUnmounted(() => {
  discoverClearAutoplay()
  if (discoverTouchResumeTimerId != null) {
    clearTimeout(discoverTouchResumeTimerId)
    discoverTouchResumeTimerId = null
  }
  document.removeEventListener('visibilitychange', onDiscoverVisibility)
  if (robotsMetaEl && robotsMetaEl.parentNode) {
    robotsMetaEl.parentNode.removeChild(robotsMetaEl)
  }
  robotsMetaEl = null
})
</script>

<template>
  <main id="landing-content" class="landing-marketing" tabindex="-1">
    <a href="#landing-content" class="landing-skip">{{
      isSr ? 'Прескочи на садржај' : 'Skip to content'
    }}</a>
    <p class="landing-banner">
      {{
        isSr
          ? 'Демо изглед — стара почетна остаје на /'
          : 'Demo layout — the current home remains at /'
      }}
      <RouterLink to="/">{{ isSr ? 'Назад на почетну' : 'Back to home' }}</RouterLink>
    </p>

    <section
      class="landing-hero"
      :style="{ backgroundImage: `linear-gradient(105deg, rgba(51,35,23,0.88) 0%, rgba(51,35,23,0.45) 45%, transparent 70%), url(${heroBg})` }"
    >
      <div class="landing-hero-inner">
        <p class="landing-kicker">{{ isSr ? 'Наставна база Гоч' : 'Teaching base Goč' }}</p>
        <h1>
          {{
            isSr
              ? 'Природни резерват и смештај за студенте и госте'
              : 'Nature reserve and stays for students and guests'
          }}
        </h1>
        <p class="landing-lead">
          {{
            isSr
              ? 'Истражите смештај, вести и садржаје Шумарског факултета. Ова страница је привремена презентација новог изгледа.'
              : 'Explore accommodation, news, and Faculty of Forestry content. This page is a temporary preview of a new look.'
          }}
        </p>
        <div class="landing-hero-cta">
          <RouterLink to="/smestaj" class="landing-btn landing-btn-primary">{{
            isSr ? 'Смештај' : 'Accommodation'
          }}</RouterLink>
          <RouterLink to="/vesti" class="landing-btn landing-btn-ghost">{{
            isSr ? 'Вести' : 'News'
          }}</RouterLink>
        </div>
      </div>
    </section>

    <section class="landing-strip" aria-label="summary">
      <div class="landing-strip-inner landing-strip-glass">
        <div class="landing-strip-item">
          <span class="landing-strip-value">7+</span>
          <span class="landing-strip-label">{{ isSr ? 'дана отказа' : 'day cancel window' }}</span>
        </div>
        <div class="landing-strip-item">
          <span class="landing-strip-value">SR / EN</span>
          <span class="landing-strip-label">{{ isSr ? 'језик сајта' : 'site language' }}</span>
        </div>
        <div class="landing-strip-item">
          <span class="landing-strip-value">UF</span>
          <span class="landing-strip-label">{{ isSr ? 'Шумарски факултет' : 'Faculty of Forestry' }}</span>
        </div>
      </div>
    </section>

    <section class="landing-discover" id="landing-discover">
      <div class="landing-discover-grid">
        <div
          ref="discoverMosaicEl"
          class="landing-discover-mosaic"
          :style="{ '--discover-n': discoverQuickLinks.length }"
          @focusin.capture="onDiscoverMosaicFocusIn"
          @focusout.capture="onDiscoverMosaicFocusOut"
        >
          <div
            class="landing-discover-carousel-row"
            role="group"
            :aria-label="isSr ? 'Карусел брзих линкова' : 'Quick links carousel'"
            @mouseenter="onDiscoverMosaicEnter"
            @mouseleave="onDiscoverMosaicLeave"
          >
            <button
              type="button"
              class="landing-carousel-arrow landing-carousel-arrow--prev"
              :aria-label="isSr ? 'Претходни слајд' : 'Previous slide'"
              @click="discoverPrev"
            >
              ‹
            </button>
            <div
              id="discover-carousel-viewport"
              class="landing-discover-carousel-viewport"
              tabindex="0"
              role="region"
              :aria-label="isSr ? 'Брзи линкови' : 'Quick links'"
              :aria-roledescription="isSr ? 'карусел' : 'carousel'"
              @keydown.left.prevent="discoverPrev"
              @keydown.right.prevent="discoverNext"
              @touchstart.passive="onDiscoverTouchStart"
              @touchend.passive="onDiscoverTouchEnd"
            >
              <div class="landing-discover-carousel-track" :style="discoverTrackStyle">
                <div
                  v-for="(item, idx) in discoverQuickLinks"
                  :key="idx"
                  class="landing-discover-carousel-slide"
                  :inert="idx !== discoverIndex"
                >
                  <a
                    v-if="item.external"
                    :href="item.href"
                    class="landing-discover-tile landing-discover-tile--carousel"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div class="landing-photo" :style="{ backgroundImage: `url(${item.img})` }" aria-hidden="true" />
                    <div class="landing-discover-tile-cap">
                      <span class="landing-discover-tile-title">{{ item.title }}</span>
                      <span class="landing-discover-tile-dek">{{ item.dek }}</span>
                      <span class="landing-discover-tile-arrow" aria-hidden="true">↗</span>
                    </div>
                  </a>
                  <RouterLink v-else :to="item.to" class="landing-discover-tile landing-discover-tile--carousel">
                    <div class="landing-photo" :style="{ backgroundImage: `url(${item.img})` }" aria-hidden="true" />
                    <div class="landing-discover-tile-cap">
                      <span class="landing-discover-tile-title">{{ item.title }}</span>
                      <span class="landing-discover-tile-dek">{{ item.dek }}</span>
                      <span class="landing-discover-tile-arrow" aria-hidden="true">→</span>
                    </div>
                  </RouterLink>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="landing-carousel-arrow landing-carousel-arrow--next"
              :aria-label="isSr ? 'Следећи слајд' : 'Next slide'"
              @click="discoverNext"
            >
              ›
            </button>
          </div>
          <div
            class="landing-carousel-dots"
            role="group"
            :aria-label="isSr ? 'Избор слајда' : 'Slide picker'"
          >
            <button
              v-for="(item, idx) in discoverQuickLinks"
              :key="'dot-' + idx"
              type="button"
              class="landing-carousel-dot"
              :class="{ 'landing-carousel-dot--active': idx === discoverIndex }"
              :aria-label="(isSr ? 'Слајд' : 'Slide') + ' ' + (idx + 1) + ': ' + item.title"
              :aria-current="idx === discoverIndex ? 'true' : undefined"
              @click="discoverGoTo(idx)"
            />
          </div>
        </div>
        <div class="landing-discover-copy landing-discover-glass">
          <h2>{{ isSr ? 'Упознајте Гоч' : 'Discover Goč' }}</h2>
          <p>
            {{
              isSr
                ? 'Шумски предели, наставна инфраструктура и смештај у оквиру Универзитета у Београду. Карусел лево је брзи приступ (није галерија); аутоматско окретање — пауза на ховер изнад слајдова или док је фокус у каруселу. Садржај касније из CMS-а.'
                : 'Forest landscapes, teaching infrastructure, and accommodation within the University of Belgrade. The carousel is quick access (not a gallery); autoplay runs continuously, pausing only while the pointer is over the slide row or while keyboard focus is inside the carousel. Content can come from your CMS later.'
            }}
          </p>
          <RouterLink to="/" class="landing-btn landing-btn-outline">{{
            isSr ? 'Главна страница' : 'Main site home'
          }}</RouterLink>
        </div>
      </div>
    </section>

    <section class="landing-highlights" aria-labelledby="landing-highlights-title">
      <div class="landing-highlights-inner">
        <h2 id="landing-highlights-title">
          {{
            isSr
              ? 'Шта нуди база'
              : 'What the base offers'
          }}
        </h2>
        <div class="landing-cards">
          <article class="landing-card">
            <div class="landing-card-img" :style="{ backgroundImage: `url(${imgCard1})` }" />
            <h3>{{ isSr ? 'Смештај' : 'Stays' }}</h3>
            <p>{{ isSr ? 'Собе и објекти за праксу и посете.' : 'Rooms and facilities for practice and visits.' }}</p>
            <RouterLink to="/smestaj" class="landing-link">{{ isSr ? 'Преглед' : 'Browse' }} →</RouterLink>
          </article>
          <article class="landing-card">
            <div class="landing-card-img" :style="{ backgroundImage: `url(${imgCard2})` }" />
            <h3>{{ isSr ? 'Вести' : 'News' }}</h3>
            <p>{{ isSr ? 'Актуелности и обавештења.' : 'Updates and announcements.' }}</p>
            <RouterLink to="/vesti" class="landing-link">{{ isSr ? 'Вести' : 'News' }} →</RouterLink>
          </article>
          <article class="landing-card">
            <div class="landing-card-img" :style="{ backgroundImage: `url(${imgCard3})` }" />
            <h3>{{ isSr ? 'Факултет' : 'Faculty' }}</h3>
            <p>{{ isSr ? 'Шумарски факултет — званични подаци на главној страни.' : 'Faculty of Forestry — official content on the main home page.' }}</p>
            <RouterLink to="/" class="landing-link">{{ isSr ? 'Почетна' : 'Home' }} →</RouterLink>
          </article>
        </div>
      </div>
    </section>

    <section class="landing-news" aria-labelledby="landing-news-title">
      <div class="landing-news-board">
        <div class="landing-news-head">
          <h2 id="landing-news-title">{{ isSr ? 'Актуелности' : 'Highlights' }}</h2>
          <RouterLink to="/vesti" class="landing-news-all">{{ isSr ? 'Све вести' : 'All news' }} →</RouterLink>
        </div>

        <div class="landing-news-magazine">
        <RouterLink to="/vesti" class="landing-news-hero">
          <div class="landing-news-hero-bg" :style="{ backgroundImage: `url(${imgNewsMain})` }" aria-hidden="true" />
          <div class="landing-news-hero-scrim" aria-hidden="true" />
          <div class="landing-news-hero-copy">
            <span class="landing-news-tag">{{ isSr ? 'Избор уредника' : 'Editor’s pick' }}</span>
            <h3>
              {{
                isSr
                  ? 'Шетње, терени и настава под отвореним небом'
                  : 'Walks, field classes, and teaching outdoors'
              }}
            </h3>
            <p class="landing-news-hero-lead">
              {{
                isSr
                  ? 'Кратак сажетак онога што посетиоци најчешће траже: руте, смештај, логистика праксе. Касније овде везујете праве вести из CMS-а.'
                  : 'A short summary of what visitors ask for most: routes, stays, and practice logistics. Later you bind real news from the CMS here.'
              }}
            </p>
            <span class="landing-news-hero-cta">{{ isSr ? 'Отвори вести' : 'Open news' }} →</span>
          </div>
        </RouterLink>

        <div class="landing-news-rail">
          <RouterLink
            to="/smestaj"
            class="landing-glass-card"
          >
            <div
              class="landing-glass-thumb"
              :style="{ backgroundImage: `url(${imgNewsRail[0]})` }"
              aria-hidden="true"
            />
            <div class="landing-glass-body">
              <span class="landing-glass-kicker">{{ isSr ? 'Смештај' : 'Stays' }}</span>
              <span class="landing-glass-title">{{ isSr ? 'Капацитети и резервације' : 'Capacity & bookings' }}</span>
              <span class="landing-glass-dek">{{
                isSr ? 'Преглед објеката и соба за госте и студенте.' : 'Facilities and rooms for guests and students.'
              }}</span>
            </div>
          </RouterLink>

          <RouterLink to="/vesti" class="landing-glass-card">
            <div
              class="landing-glass-thumb"
              :style="{ backgroundImage: `url(${imgNewsRail[1]})` }"
              aria-hidden="true"
            />
            <div class="landing-glass-body">
              <span class="landing-glass-kicker">{{ isSr ? 'Календар' : 'Calendar' }}</span>
              <span class="landing-glass-title">{{ isSr ? 'Догађаји и обавештења' : 'Events & notices' }}</span>
              <span class="landing-glass-dek">{{
                isSr ? 'Ажурирања са терена и факултета.' : 'Field and faculty updates.'
              }}</span>
            </div>
          </RouterLink>

          <RouterLink to="/prijava" class="landing-glass-card">
            <div
              class="landing-glass-thumb"
              :style="{ backgroundImage: `url(${imgNewsRail[2]})` }"
              aria-hidden="true"
            />
            <div class="landing-glass-body">
              <span class="landing-glass-kicker">{{ isSr ? 'Гости' : 'Guests' }}</span>
              <span class="landing-glass-title">{{ isSr ? 'Пријава и налог' : 'Sign-in & account' }}</span>
              <span class="landing-glass-dek">{{
                isSr ? 'Резервације, откази, ваучери — на једном месту.' : 'Reservations, cancellations, vouchers.'
              }}</span>
            </div>
          </RouterLink>
        </div>
      </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-footer-shell">
        <div class="landing-footer-brand">
          <div class="landing-footer-wordmark">
            <span class="landing-footer-title">{{ isSr ? 'Наставна база' : 'Teaching base' }}</span>
            <span class="landing-footer-sub">{{ isSr ? 'Гоч' : 'Goč' }}</span>
          </div>
          <span class="landing-footer-badge">{{ isSr ? 'Преглед изгледа' : 'Layout preview' }}</span>
          <p class="landing-footer-line">
            {{
              isSr
                ? 'Шумарски факултет · смештај и настава у природи'
                : 'Faculty of Forestry · stays and field teaching'
            }}
          </p>
        </div>

        <nav class="landing-footer-nav" :aria-label="isSr ? 'Навигација подножја' : 'Footer navigation'">
          <div class="landing-footer-col">
            <span class="landing-footer-col-label">{{ isSr ? 'Садржај' : 'Explore' }}</span>
            <RouterLink to="/" class="landing-footer-link">{{ isSr ? 'Почетна' : 'Home' }}</RouterLink>
            <RouterLink to="/smestaj" class="landing-footer-link">{{ isSr ? 'Смештај' : 'Accommodation' }}</RouterLink>
            <RouterLink to="/vesti" class="landing-footer-link">{{ isSr ? 'Вести' : 'News' }}</RouterLink>
          </div>
          <div class="landing-footer-col">
            <span class="landing-footer-col-label">{{ isSr ? 'Корисници' : 'Guests' }}</span>
            <RouterLink to="/prijava" class="landing-footer-link">{{ isSr ? 'Пријава' : 'Sign in' }}</RouterLink>
            <RouterLink to="/moj-nalog" class="landing-footer-link">{{ isSr ? 'Мој налог' : 'My account' }}</RouterLink>
          </div>
          <div class="landing-footer-col">
            <span class="landing-footer-col-label">{{ isSr ? 'Институција' : 'Institution' }}</span>
            <a
              class="landing-footer-link landing-footer-external"
              href="https://www.sfb.bg.ac.rs/"
              target="_blank"
              rel="noopener noreferrer"
            >{{ isSr ? 'Шумарски факултет' : 'Faculty of Forestry' }}</a>
            <span class="landing-footer-meta">Univerzitet u Beogradu</span>
          </div>
        </nav>
      </div>

      <div class="landing-footer-base">
        <span class="landing-footer-copy">© {{ new Date().getFullYear() }}</span>
        <span class="landing-footer-dot" aria-hidden="true">·</span>
        <span class="landing-footer-copy">{{ isSr ? 'Демо /landing — продукција користи главни сајт' : 'Demo /landing — production uses main site' }}</span>
      </div>
    </footer>
  </main>
</template>

<style scoped>
/*
  Typography: system / “default OS” stack — no webfonts, fast first paint.
  See https://modernfontstacks.com/ and https://css-tricks.com/snippets/css/system-font-stack/
*/
.landing-marketing {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --c-text: #332317;
  --c-accent: #cdac91;
  --c-bg: #fdf9f5;
  --c-olive: #4a5c3a;
  font-family: var(--font-sans);
  color: var(--c-text);
  background: var(--c-bg);
  min-height: 60vh;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.landing-skip {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.landing-skip:focus {
  position: fixed;
  left: 12px;
  top: 12px;
  z-index: 9999;
  width: auto;
  height: auto;
  padding: 10px 16px;
  background: #fff;
  color: var(--c-text);
  border: 2px solid var(--c-text);
  font-weight: 600;
  text-decoration: none;
  clip: auto;
}

.landing-banner {
  margin: 0;
  padding: 10px 20px;
  font-size: 0.85rem;
  background: #ebe4dc;
  border-bottom: 1px solid var(--c-accent);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.landing-banner a {
  color: var(--c-text);
  font-weight: 600;
}
.landing-banner a:focus-visible {
  outline: 2px solid var(--c-text);
  outline-offset: 2px;
}

/* Pulls up over hero so frosted bar blurs forest — glass belongs here, not on photo tiles. */
.landing-strip {
  position: relative;
  z-index: 2;
  margin-top: -56px;
  padding: 0 16px 8px;
  background: transparent;
  border-bottom: none;
  content-visibility: auto;
  contain-intrinsic-size: 0 120px;
}
@media (max-width: 640px) {
  .landing-strip {
    margin-top: -32px;
    padding: 0 12px 6px;
  }
}
.landing-strip-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 22px 20px 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow: 0 12px 40px rgba(51, 35, 23, 0.14);
  /* Fallback when blur unsupported: soft solid. */
  background: rgba(253, 249, 245, 0.92);
}
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .landing-strip-inner.landing-strip-glass {
    -webkit-backdrop-filter: blur(22px) saturate(1.25);
    backdrop-filter: blur(22px) saturate(1.25);
    /* Light, airy glass — hero shows through at overlap. */
    background: rgba(253, 249, 245, 0.26);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .landing-strip-inner.landing-strip-glass {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: rgba(253, 249, 245, 0.96);
  }
}
@media (max-width: 640px) {
  .landing-strip-inner {
    grid-template-columns: 1fr;
    padding: 18px 16px 20px;
  }
}
.landing-strip-item {
  padding: 8px 4px;
}
.landing-strip-value {
  display: block;
  font-weight: 700;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  letter-spacing: 0.02em;
  color: #3d4d32;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}
.landing-strip-label {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  color: rgba(51, 35, 23, 0.82);
  line-height: 1.35;
}

.landing-hero {
  position: relative;
  z-index: 1;
  background-size: cover;
  background-position: center;
  min-height: min(72vh, 560px);
  display: flex;
  align-items: flex-end;
}
.landing-hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 20px 48px;
  width: 100%;
}
/* Leave room for the frosted strip that overlaps the hero photo. */
@media (min-width: 641px) {
  .landing-hero-inner {
    padding-bottom: 88px;
  }
}
.landing-kicker {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #e8dccf;
  margin: 0 0 8px;
}
.landing-hero h1 {
  margin: 0 0 12px;
  font-size: clamp(1.65rem, 2.8vw + 1rem, 2.55rem);
  line-height: 1.15;
  color: #fff;
  max-width: 22ch;
  text-wrap: balance;
}
.landing-lead {
  margin: 0 0 20px;
  max-width: 56ch;
  color: #f2ebe4;
  font-size: clamp(0.9rem, 0.6vw + 0.82rem, 1.05rem);
  line-height: 1.6;
}
.landing-hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.landing-btn {
  display: inline-block;
  padding: 10px 20px;
  text-decoration: none;
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: 0;
  font-size: 0.9rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease;
}
@media (prefers-reduced-motion: reduce) {
  .landing-btn {
    transition: none;
  }
}
.landing-btn:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}
.landing-btn-primary:focus-visible {
  outline-color: var(--c-text);
}
.landing-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}
@media (prefers-reduced-motion: reduce) {
  .landing-btn:hover {
    transform: none;
    box-shadow: none;
  }
}
.landing-btn-primary {
  background: var(--c-accent);
  color: var(--c-text);
  border-color: var(--c-accent);
}
.landing-btn-ghost {
  background: transparent;
  color: #fff;
  border-color: #fff;
}
.landing-btn-outline {
  background: transparent;
  color: var(--c-text);
  border-color: var(--c-text);
}

.landing-discover {
  position: relative;
  z-index: 0;
  background: linear-gradient(145deg, #3f5133 0%, var(--c-olive) 42%, #3d4d32 100%);
  color: #f5f1ea;
  padding: 56px 20px 60px;
  content-visibility: auto;
  contain-intrinsic-size: 0 560px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.landing-discover-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(24px, 3.5vw, 40px);
  align-items: start;
}
@media (max-width: 820px) {
  .landing-discover-grid {
    grid-template-columns: 1fr;
    gap: 26px;
  }
}

.landing-discover-mosaic {
  position: relative;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  box-shadow: none;
}

/* One row: arrows match viewport height; dots sit below (not in this row). */
.landing-discover-carousel-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: stretch;
}
.landing-carousel-arrow {
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-width: 40px;
  min-height: 0;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.12);
  color: #fff;
  font-size: 1.65rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.landing-carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}
@media (max-width: 520px) {
  .landing-carousel-arrow {
    width: 34px;
    min-width: 34px;
    font-size: 1.35rem;
  }
}
.landing-discover-carousel-viewport {
  overflow: hidden;
  min-width: 0;
  width: 100%;
  align-self: stretch;
  aspect-ratio: 16 / 10;
  max-height: min(46vw, 380px);
  margin-inline: 0;
  outline: none;
  display: flex;
  flex-direction: column;
}
.landing-discover-carousel-viewport:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.55);
  border-radius: 2px;
}
.landing-discover-carousel-track {
  display: flex;
  height: 100%;
  align-items: stretch;
  width: calc(var(--discover-n, 7) * 100%);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .landing-discover-carousel-track {
    transition: none;
  }
}
.landing-discover-carousel-slide {
  flex: 0 0 calc(100% / var(--discover-n, 7));
  min-width: 0;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}
.landing-discover-tile--carousel {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.landing-discover-tile {
  position: relative;
  display: block;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.landing-discover-tile:hover {
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}
.landing-discover-tile .landing-photo {
  width: 100%;
  min-width: 0;
  margin: 0;
  aspect-ratio: 16 / 10;
  min-height: 140px;
  background-size: cover;
  background-position: center;
  border: none;
  border-radius: 0;
  box-shadow: none;
  transition: transform 0.4s ease;
}
.landing-discover-tile.landing-discover-tile--carousel .landing-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  aspect-ratio: unset;
  flex: none;
}
@media (prefers-reduced-motion: reduce) {
  .landing-discover-tile .landing-photo {
    transition: none;
  }
}
.landing-discover-tile:hover .landing-photo {
  transform: scale(1.05);
}
@media (prefers-reduced-motion: reduce) {
  .landing-discover-tile:hover .landing-photo {
    transform: none;
  }
}
.landing-discover-tile--carousel .landing-discover-tile-cap {
  z-index: 2;
}
.landing-discover-tile-cap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 36px 12px 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 8px;
  row-gap: 2px;
  align-items: end;
  background: linear-gradient(0deg, rgba(10, 9, 7, 0.92) 0%, rgba(10, 9, 7, 0.5) 52%, transparent 100%);
  pointer-events: none;
}
.landing-discover-tile-title {
  grid-column: 1;
  grid-row: 1;
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.landing-discover-tile-dek {
  grid-column: 1;
  grid-row: 2;
  font-size: 0.72rem;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.82);
}
.landing-discover-tile-arrow {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  font-size: 1.15rem;
  font-weight: 600;
  color: #e8dccf;
  line-height: 1;
}

.landing-carousel-dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 8px 4px;
}
.landing-carousel-dot {
  width: 11px;
  height: 11px;
  min-width: 11px;
  min-height: 11px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.landing-carousel-dot:hover {
  background: rgba(255, 255, 255, 0.45);
}
.landing-carousel-dot--active {
  background: #fff;
  border-color: #fff;
  transform: scale(1.2);
}
@media (prefers-reduced-motion: reduce) {
  .landing-carousel-dot--active {
    transform: none;
  }
}
.landing-carousel-arrow:focus-visible,
.landing-carousel-dot:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.landing-discover-copy {
  align-self: start;
}
.landing-discover-glass {
  padding: 26px 28px 28px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .landing-discover-glass {
    -webkit-backdrop-filter: blur(12px) saturate(1.1);
    backdrop-filter: blur(12px) saturate(1.1);
    background: rgba(255, 255, 255, 0.06);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .landing-discover-glass {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: rgba(0, 0, 0, 0.22);
  }
}
.landing-discover-copy h2 {
  margin: 0 0 12px;
  font-size: clamp(1.25rem, 1.5vw + 1rem, 1.65rem);
  color: #fff;
  text-wrap: balance;
}
.landing-discover-copy p {
  margin: 0 0 18px;
  line-height: 1.55;
  opacity: 0.94;
}
.landing-discover .landing-btn-outline {
  color: #faf7f2;
  border-color: rgba(255, 255, 255, 0.55);
}
.landing-discover .landing-btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.85);
}
.landing-discover .landing-btn-outline:focus-visible {
  outline-color: #fff;
}

/* Middle chapter: lighter band + hairline so it does not read as one oversized “hero” block. */
.landing-highlights {
  padding: 44px 20px 48px;
  margin: 0;
  content-visibility: auto;
  contain-intrinsic-size: 0 480px;
  background: linear-gradient(180deg, #fdf9f5 0%, #faf6f0 45%, #f7f1ea 100%);
  border-top: 1px solid rgba(227, 196, 173, 0.55);
  border-bottom: 1px solid rgba(227, 196, 173, 0.35);
}
.landing-highlights-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.landing-highlights-inner > h2 {
  margin: 0 0 20px;
  font-size: clamp(1.2rem, 1.1vw + 1rem, 1.48rem);
  text-wrap: balance;
  max-width: 42ch;
}
.landing-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 820px) {
  .landing-cards {
    grid-template-columns: 1fr;
  }
}
.landing-card {
  background: #fff;
  border: 1px solid #e3c4ad;
  padding: 0 0 16px;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(51, 35, 23, 0.06);
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}
@media (prefers-reduced-motion: reduce) {
  .landing-card {
    transition: none;
  }
}
.landing-card:hover {
  box-shadow: 0 10px 28px rgba(51, 35, 23, 0.1);
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
  .landing-card:hover {
    transform: none;
  }
}
.landing-card-img {
  aspect-ratio: 16 / 10;
  min-height: 140px;
  background-size: cover;
  background-position: center;
  border-bottom: 1px solid #e3c4ad;
}
.landing-card h3 {
  margin: 14px 16px 6px;
  font-size: 1.05rem;
}
.landing-card p {
  margin: 0 16px 12px;
  font-size: 0.88rem;
  line-height: 1.45;
}
.landing-link {
  margin: 0 16px;
  font-weight: 600;
  color: var(--c-text);
}
.landing-link:focus-visible,
.landing-news-all:focus-visible,
.landing-news-hero:focus-visible,
.landing-glass-card:focus-visible,
.landing-footer-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}
.landing-discover-tile:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  z-index: 1;
}

/* Aktuelnosti: slightly darker band + inner frosted board (design can tune tokens later). */
.landing-news {
  padding: 40px 20px 56px;
  margin: 0;
  content-visibility: auto;
  contain-intrinsic-size: 0 540px;
  background: linear-gradient(168deg, #e4dcd2 0%, #ddd3c8 42%, #d4cbc0 100%);
  border-top: 1px solid rgba(120, 98, 78, 0.18);
}
.landing-news-board {
  max-width: 1100px;
  margin: 0 auto;
  padding: 22px 20px 24px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(253, 249, 245, 0.55);
  box-shadow: 0 10px 36px rgba(51, 35, 23, 0.07);
}
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .landing-news-board {
    -webkit-backdrop-filter: blur(14px) saturate(1.06);
    backdrop-filter: blur(14px) saturate(1.06);
    background: rgba(253, 249, 245, 0.38);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .landing-news-board {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: rgba(253, 249, 245, 0.94);
  }
}
.landing-news-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 10px;
}
.landing-news-head h2 {
  margin: 0;
  font-size: 1.35rem;
}
.landing-news-all {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-accent);
  text-decoration: none;
}
.landing-news-all:hover {
  text-decoration: underline;
}

/* Magazine row: tall hero + stacked glass rail (editorial / bento-adjacent pattern). */
.landing-news-magazine {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.95fr);
  gap: 22px;
  align-items: stretch;
}
@media (max-width: 900px) {
  .landing-news-magazine {
    grid-template-columns: 1fr;
  }
}

.landing-news-hero {
  position: relative;
  display: block;
  min-height: 400px;
  text-decoration: none;
  color: var(--c-text);
  border: 1px solid #e3c4ad;
  overflow: hidden;
  isolation: isolate;
}
@media (min-width: 901px) {
  .landing-news-hero {
    min-height: 440px;
  }
}
.landing-news-hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.03);
  transition: transform 0.45s ease;
}
.landing-news-hero:hover .landing-news-hero-bg {
  transform: scale(1.06);
}
/* Keep photo clean: light vignette only, no frosted panel on the image. */
.landing-news-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 52%,
    rgba(51, 35, 23, 0.18) 100%
  );
  pointer-events: none;
}
.landing-news-hero-copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: 36px 20px 22px;
  max-width: 100%;
  background: linear-gradient(
    0deg,
    rgba(17, 12, 9, 0.88) 0%,
    rgba(17, 12, 9, 0.55) 42%,
    transparent 100%
  );
  color: #f8f3ed;
}
.landing-news-tag {
  display: inline-block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #e8d5c4;
}
.landing-news-hero h3 {
  margin: 8px 0 0;
  font-size: clamp(1.2rem, 2.4vw, 1.45rem);
  line-height: 1.25;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}
.landing-news-hero-lead {
  margin: 10px 0 0;
  max-width: 40rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.88);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.landing-news-hero-cta {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #f0dcc8;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(240, 220, 200, 0.55);
}
.landing-news-hero:hover .landing-news-hero-cta {
  color: #fff;
  text-decoration-color: rgba(255, 255, 255, 0.75);
}

.landing-news-rail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.landing-glass-card {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 14px;
  align-items: stretch;
  padding: 12px 14px;
  text-decoration: none;
  color: var(--c-text);
  border: 1px solid rgba(227, 196, 173, 0.65);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 4px 18px rgba(51, 35, 23, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .landing-glass-card {
    -webkit-backdrop-filter: blur(16px) saturate(1.08);
    backdrop-filter: blur(16px) saturate(1.08);
    background: rgba(255, 255, 255, 0.22);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .landing-glass-card {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: #fff;
  }
}
.landing-glass-card:hover {
  border-color: rgba(139, 90, 43, 0.45);
  box-shadow: 0 8px 28px rgba(51, 35, 23, 0.08);
  transform: translateY(-1px);
}
.landing-glass-thumb {
  flex: 0 0 88px;
  width: 88px;
  align-self: stretch;
  min-height: 88px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(227, 196, 173, 0.6);
}
.landing-glass-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}
.landing-glass-kicker {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 700;
  color: var(--c-accent);
}
.landing-glass-title {
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.25;
  color: #2a2119;
}
.landing-glass-dek {
  font-size: 0.82rem;
  line-height: 1.4;
  color: rgba(42, 33, 25, 0.72);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 900px) {
  .landing-news-rail {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .landing-glass-card {
    flex: 1 1 100%;
  }
}
@media (max-width: 520px) {
  .landing-glass-thumb {
    flex-basis: 72px;
    width: 72px;
    min-height: 72px;
  }
}

.landing-footer {
  background: linear-gradient(180deg, #3d4d32 0%, #35442b 48%, #2e3b26 100%);
  color: #f2eee8;
  padding: 0;
  border-top: 1px solid rgba(205, 172, 145, 0.35);
}

.landing-footer-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 20px 28px;
  display: grid;
  grid-template-columns: minmax(200px, 1.05fr) minmax(0, 1.6fr);
  gap: 40px 48px;
  align-items: start;
}
@media (max-width: 780px) {
  .landing-footer-shell {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.landing-footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}
@media (max-width: 780px) {
  .landing-footer-brand {
    border-right: none;
    padding-right: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }
}

.landing-footer-wordmark {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 10px;
  letter-spacing: -0.03em;
  line-height: 1;
}
.landing-footer-title {
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 800;
  color: #fff;
}
.landing-footer-sub {
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 500;
  color: var(--c-accent);
}

.landing-footer-badge {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(205, 172, 145, 0.55);
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.12);
}

.landing-footer-line {
  margin: 4px 0 0;
  max-width: 28ch;
  font-size: 0.82rem;
  line-height: 1.45;
  color: rgba(242, 238, 232, 0.82);
  font-weight: 400;
}

.landing-footer-nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px 28px;
}
@media (max-width: 520px) {
  .landing-footer-nav {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 380px) {
  .landing-footer-nav {
    grid-template-columns: 1fr;
  }
}

.landing-footer-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.landing-footer-col-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(205, 172, 145, 0.95);
  margin-bottom: 4px;
}

.landing-footer-link {
  font-size: 0.88rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.94);
  text-decoration: none;
  padding: 2px 0;
  border-bottom: 1px solid transparent;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.landing-footer-link:hover {
  color: #fff;
  border-bottom-color: rgba(205, 172, 145, 0.65);
}
.landing-footer-external {
  font-weight: 600;
}
.landing-footer-meta {
  font-size: 0.72rem;
  color: rgba(242, 238, 232, 0.55);
  margin-top: 4px;
  letter-spacing: 0.02em;
}

.landing-footer-base {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 20px 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  font-size: 0.72rem;
  color: rgba(242, 238, 232, 0.55);
}
.landing-footer-copy {
  line-height: 1.4;
}
.landing-footer-dot {
  opacity: 0.45;
  user-select: none;
}
</style>

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import { useClub, useClubIdParam, useClubNavigation } from '../hooks/useClub';
import { clubBlurb, getCategoryMeta } from '../data/categoryMeta';
import { asset, clubImageSrc } from '../data/clubs';
import type { Club } from '../data/clubs';

const RATING_IMG: Record<string, string> = {
  'five-star': 'icons/five-star-club.png',
  outstanding: 'icons/good-club.png',
};
import { useLocation } from 'react-router-dom';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-8 inline-flex items-center gap-2 text-sm text-brand-light transition-colors hover:text-white active:brightness-50"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="font-medium">返回 Back</span>
    </button>
  );
}

// Embeds a generated HTML poster. The poster is width-fluid and content-height,
// so we measure its document height (same-origin, served from our own domain)
// and grow the iframe to match — no inner scrollbar, matches the image posters.
function PosterFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;

    const measure = () => {
      const body = iframe.contentDocument?.body;
      if (!body) return;
      // documentElement.scrollHeight is floored at the iframe's own viewport
      // height, so a poster shorter than the placeholder aspect-ratio would lock
      // in that inflated height (leaving a gap below). The body's content box is
      // not viewport-clamped, so it reports the poster's true height either way.
      const h = Math.ceil(body.getBoundingClientRect().height);
      if (h) setHeight(h);
    };

    const onLoad = () => {
      measure();
      const body = iframe.contentDocument?.body;
      if (body && 'ResizeObserver' in window) {
        observer = new ResizeObserver(measure);
        observer.observe(body);
      }
    };

    iframe.addEventListener('load', onLoad);
    // Already loaded (e.g. cached) before the listener attached.
    if (iframe.contentDocument?.readyState === 'complete') onLoad();

    return () => {
      iframe.removeEventListener('load', onLoad);
      observer?.disconnect();
    };
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      loading="lazy"
      scrolling="no"
      // Before the first measure lands, hold a poster-like ratio so the layout
      // doesn't jump; once measured we switch to the exact content height.
      style={
        height
          ? { height: `${height}px`, border: 0, display: 'block' }
          : { aspectRatio: '3 / 4', border: 0, display: 'block' }
      }
      className="w-full rounded-2xl shadow-lift ring-1 ring-white/10"
    />
  );
}

function NotFound({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="py-24 text-center">
      <h2 className="font-display text-3xl font-bold text-white/70">社团未找到</h2>
      <p className="mt-2 text-white/40">This club could not be found.</p>
      <button
        onClick={onGoHome}
        className="mt-6 rounded-full bg-brand-light px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105 active:brightness-50"
      >
        返回首页 Home
      </button>
    </div>
  );
}

function ClubHeader({ club }: { club: Club }) {
  const meta = getCategoryMeta(club.category);
  const src = clubImageSrc(club);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-white/10">
      <div className="relative h-72 w-full sm:h-96">
        {src ? (
          <img src={src} alt={club.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900 text-white/40">
            {club.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: meta.accent, border: `1px solid ${meta.accent}`, background: 'rgba(0,0,0,0.4)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.accent }} />
          {meta.en} · {meta.cn}
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
          {club.name}
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em]" style={{ color: meta.accent }}>
          {club.shortDesc}
        </p>
      </div>
    </div>
  );
}

export default function ClubDetail() {
  const clubId = useClubIdParam();
  const club = useClub(clubId);
  const { goHome } = useClubNavigation();
  const location = useLocation();
  const fromActivity = (location.state as any)?.fromActivity;

  const handleBack = fromActivity
    ? () => window.history.back()
    : goHome;
  const meta = club ? getCategoryMeta(club.category) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <BackButton onClick={handleBack} />
          {club ? (
            <div className="animate-fade-up">
              <ClubHeader club={club} />

              {/* Intro */}
              <div className="mt-10 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="eyebrow mb-3 text-xs font-semibold" style={{ color: meta?.accent }}>
                    关于社团 · About
                  </h3>
                  <p className="text-base leading-relaxed text-white/75">
                    {clubBlurb(club, '，留下属于你的高中印记')}
                  </p>
                  {club.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {club.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-3 py-1 text-sm text-white/80"
                          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${meta?.accent}40` }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* The club's own recruitment poster, shown full so it's readable.
                      Either a generated HTML poster (iframe) or submitted images. */}
                  {(club.posterHtml || club.posters.length > 0) && (
                    <div className="mt-8">
                      <h3 className="eyebrow mb-4 text-xs font-semibold" style={{ color: meta?.accent }}>
                        招新海报 · Poster
                      </h3>
                      <div className="flex flex-col gap-6">
                        {club.posterHtml && (
                          <PosterFrame src={asset(club.posterHtml)} title={`${club.name} 招新海报`} />
                        )}
                        {club.posters.map((poster, i) => (
                          <img
                            key={poster}
                            src={asset(poster)}
                            alt={`${club.name} 海报 ${i + 1}`}
                            className="w-full rounded-2xl shadow-lift ring-1 ring-white/10"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <aside className="glass self-start rounded-2xl p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                    信息 · Info
                  </h3>
                  {club.rating && (
                    <div className="mb-4 flex items-center gap-2">
                      <img
                        src={asset(RATING_IMG[club.rating])}
                        alt={club.rating === 'five-star' ? '五星社团' : '优秀社团'}
                        className="h-14 w-auto object-contain"
                      />
                      <span className="text-sm font-medium text-white/80">
                        {club.rating === 'five-star' ? '五星社团' : '优秀社团'}
                      </span>
                    </div>
                  )}
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-white/40">领域 Category</dt>
                      <dd className="text-white">{meta?.en} · {meta?.cn}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">方向 Focus</dt>
                      <dd className="text-white">{club.shortDesc}</dd>
                    </div>
                    {club.contact?.trim() && (
                      <div>
                        <dt className="text-white/40">微信 Contact</dt>
                        <dd className="text-white">{club.contact}</dd>
                      </div>
                    )}
                  </dl>

                  {club.qrcodes.length > 0 && (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                        扫码进群 · Join Group
                      </h3>
                      <div className="flex flex-col gap-3">
                        {club.qrcodes.map((qr, i) => (
                          <img
                            key={qr}
                            src={asset(qr)}
                            alt={`${club.name} 招新群二维码 ${i + 1}`}
                            className="w-full rounded-lg bg-white p-2"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {club.cpQrcodes.length > 0 && (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                        社长微信 · Club President
                      </h3>
                      <div className="flex flex-col gap-3">
                        {club.cpQrcodes.map((qr, i) => (
                          <img
                            key={qr}
                            src={asset(qr)}
                            alt={`${club.name} 社长微信 ${i + 1}`}
                            className="w-full rounded-lg bg-white p-2"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          ) : (
            <NotFound onGoHome={goHome} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

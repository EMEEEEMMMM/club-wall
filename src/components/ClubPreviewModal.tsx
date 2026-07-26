import { useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import type { Club } from '../data/clubs';
import { clubImageSrc, asset } from '../data/clubs';
import { clubBlurb, getCategoryMeta } from '../data/categoryMeta';

const RATING_IMG: Record<string, string> = {
  'five-star': 'icons/five-star-club.png',
  outstanding: 'icons/good-club.png',
};

interface ClubPreviewModalProps {
  club: Club | null;
  onClose: () => void;
  onOpenFull: (id: string) => void;
}

/**
 * A cinematic, full-screen lightbox that previews a club without leaving the
 * wall. Large imagery on one side, editorial details on the other, themed by
 * the club's category accent. Closes on backdrop click or Escape.
 */
export default function ClubPreviewModal({ club, onClose, onOpenFull }: ClubPreviewModalProps) {
  // Lock body scroll + wire up Escape while open.
  useEffect(() => {
    if (!club) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [club, onClose]);

  if (!club) return null;

  const meta = getCategoryMeta(club.category);
  const src = clubImageSrc(club);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${club.name} preview`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative flex w-full max-w-[95vw] max-h-[90vh] flex-col overflow-hidden rounded-3xl shadow-lift animate-scale-in md:max-h-none md:w-auto md:flex-row"
        style={{ ['--accent' as string]: meta.accent }}
      >
        {/* Visual side — fixed height on desktop with the width following the
            image's aspect ratio, so the cover fills its box edge-to-edge with no
            cropping and no bands. */}
        <div className="relative flex shrink-0 items-center justify-center">
          {src ? (
            <img
              src={src}
              alt={club.name}
              className="block mx-auto w-auto max-h-[45vh] max-w-full md:mx-0 md:h-[480px] md:max-h-none md:max-w-none"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900 text-white/40 md:h-[480px] md:w-72">
              {club.name}
            </div>
          )}
        </div>

        {/* Detail side — matches the cover's fixed height and scrolls internally. */}
        <div className="flex w-full flex-1 flex-col overflow-y-auto p-6 sm:p-8 min-h-0 md:h-[480px] md:w-[380px] md:flex-none">
          <div
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: meta.accent, border: `1px solid ${meta.accent}`, background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.accent }} />
            {meta.en} · {meta.cn}
          </div>

          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {club.name}
          </h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em]" style={{ color: meta.accent }}>
            {club.shortDesc}
          </p>

          {club.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {club.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-xs text-white/80"
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${meta.accent}40` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-5 text-sm leading-relaxed text-white/70">
            {clubBlurb(club)}
          </p>

          {club.contact?.trim() && (
            <p className="mt-4 text-sm text-white/60">
              <span className="font-semibold text-white/80">微信 · Contact：</span> {club.contact}
            </p>
          )}

          {club.rating && (
            <img
              src={asset(RATING_IMG[club.rating])}
              alt={club.rating === 'five-star' ? '五星社团' : '优秀社团'}
              className="mt-4 h-14 w-auto object-contain self-start"
            />
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <button
              onClick={() => onOpenFull(club.id)}
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] active:brightness-50"
              style={{ background: meta.accent }}
            >
              查看完整详情
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
              <Sparkles className="h-3.5 w-3.5" /> 按 Esc 关闭
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white active:brightness-50"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

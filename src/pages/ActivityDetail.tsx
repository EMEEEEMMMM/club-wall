import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calendar, QrCode, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { asset } from '../data/clubs';
import { activities } from '../data/activities';
import { clubs } from '../data/clubs';
import type { Activity } from '../data/activities';
import ActivityDetailHTML from './ActivityDetailHTML';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function lightenHex(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `#${((1 << 24) + (lerp(r, 255, t) << 16) + (lerp(g, 255, t) << 8) + lerp(b, 255, t)).toString(16).slice(1)}`;
}

function darkenHex(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `#${((1 << 24) + (lerp(r, 0, t) << 16) + (lerp(g, 0, t) << 8) + lerp(b, 0, t)).toString(16).slice(1)}`;
}

function BackButton({ onClick, color }: { onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="mb-8 inline-flex items-center gap-2 text-sm transition-colors hover:!text-white active:brightness-50"
      style={{ color }}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="font-medium">返回 Back</span>
    </button>
  );
}

function ActivityHeader({ activity }: { activity: Activity }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-white/10">
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-ink-700 via-ink-600 to-ink-700 bg-[length:200%_100%]" />
        )}
        <img
          ref={imgRef}
          src={asset(activity.image)}
          alt={activity.title}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
          {activity.title}
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">{activity.shortDesc}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="glass rounded-2xl p-5 transition-shadow duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 32px ${color}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function NotFound({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="py-24 text-center">
      <h2 className="font-display text-3xl font-bold text-white/70">活动未找到</h2>
      <p className="mt-2 text-white/40">This activity could not be found.</p>
      <button
        onClick={onGoBack}
        className="mt-6 rounded-full bg-brand-light px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105 active:brightness-50"
      >
        返回首页 Home
      </button>
    </div>
  );
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const activity = activities.find((a) => a.id === id);
  const club = activity ? clubs.find((c) => c.id === activity.clubId) : undefined;

  if (activity?.detailType === 'html') {
    return <ActivityDetailHTML activity={activity} />;
  }

  const color = activity?.color ?? '#2dd4a7';

  // Theme scrollbar to activity colour
  useEffect(() => {
    if (!activity) return;
    const root = document.documentElement;
    root.style.setProperty('--theme-light', lightenHex(color, 0.4));
    root.style.setProperty('--theme', color);
    root.style.setProperty('--theme-dark', darkenHex(color, 0.6));
    return () => {
      root.style.setProperty('--theme-light', '#2dd4a7');
      root.style.setProperty('--theme', '#1A5F4A');
      root.style.setProperty('--theme-dark', '#0f3d2f');
    };
  }, [activity, color]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <BackButton onClick={() => navigate('/')} color={color} />
          {activity ? (
            <div className="animate-fade-up">
              <ActivityHeader activity={activity} />

              {/* Three-column info layout — stacked on mobile, side-by-side on desktop */}
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {/* a) Basic info */}
                <InfoCard icon={<Calendar className="h-3.5 w-3.5" />} label="基本信息" color={color}>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-white/40">所属社团</span>
                      <button
                        onClick={() => club && navigate(`/club/${club.id}`)}
                        className="mt-0.5 block text-base font-semibold transition-colors hover:!text-white active:brightness-50"
                        style={{ color }}
                      >
                        {activity.clubName}
                      </button>
                    </div>
                    <div>
                      <span className="text-xs text-white/40">活动名称</span>
                      <p className="mt-0.5 text-base text-white">{activity.title}</p>
                    </div>
                  </div>
                </InfoCard>

                {/* b) Details */}
                <InfoCard icon={<Users className="h-3.5 w-3.5" />} label="活动详情" color={color}>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-white/40">活动简介</span>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">
                        {activity.description}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40">参与要求</span>
                      <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/75 font-sans">
                        {activity.requirements}
                      </pre>
                    </div>
                  </div>
                </InfoCard>

                {/* c) Recruitment */}
                <InfoCard icon={<QrCode className="h-3.5 w-3.5" />} label="招募联系" color={color}>
                  <div>
                    <span className="text-xs text-white/40">微信</span>
                    <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/75 font-sans">
                      {activity.contact}
                    </pre>
                  </div>
                </InfoCard>
              </div>
            </div>
          ) : (
            <NotFound onGoBack={() => navigate('/')} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
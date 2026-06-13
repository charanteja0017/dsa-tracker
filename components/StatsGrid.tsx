import { Flame, CheckCircle2, Clock, Target } from "lucide-react";
import type { Analytics, Stats } from "@/lib/types";
import { COLORS } from "@/lib/colors";
import { StatCard } from "./StatCard";

const tail = (a: number[], n = 14) => a.slice(-n);

// 2×2 metric grid. Sparklines are sourced from the analytics series when loaded.
export function StatsGrid({
  stats,
  analytics,
}: {
  stats: Stats;
  analytics: Analytics | null;
}) {
  const dailySolved = analytics?.daily.map((d) => d.solved) ?? [];
  const dailyMinutes = analytics?.daily.map((d) => d.minutes) ?? [];
  const cumulative = analytics?.cumulative.map((c) => c.total) ?? [];
  const pct = stats.target > 0 ? Math.round((stats.totalSolved / stats.target) * 100) : 0;

  return (
    <div className="grid h-full grid-cols-2 gap-3">
      <StatCard
        label="Total solved"
        value={stats.totalSolved}
        icon={<CheckCircle2 className="h-4 w-4" />}
        spark={tail(cumulative)}
        sparkColor={COLORS.accent}
      />
      <StatCard
        label="Current streak"
        value={`${stats.streak}🔥`}
        icon={<Flame className="h-4 w-4" />}
        spark={tail(dailySolved)}
        sparkColor={COLORS.medium}
      />
      <StatCard
        label="Hours logged"
        value={Math.round(stats.totalMinutes / 60)}
        icon={<Clock className="h-4 w-4" />}
        spark={tail(dailyMinutes)}
        sparkColor={COLORS.easy}
      />
      <StatCard
        label="% to 271"
        value={`${pct}%`}
        sub={`${stats.totalSolved}/${stats.target}`}
        icon={<Target className="h-4 w-4" />}
        spark={tail(cumulative)}
        sparkColor={COLORS.accent}
      />
    </div>
  );
}

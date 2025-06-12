'use client';

import { LucideIcon } from 'lucide-react';

interface Stat {
  name: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'positive' | 'negative';
}

interface DashboardStatsProps {
  stats: Stat[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold">
                    <span
                      className={
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
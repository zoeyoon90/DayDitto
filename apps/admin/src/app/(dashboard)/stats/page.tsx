import { StatsCards } from '@/components/StatsCards';
import { StatsCharts } from '@/components/StatsCharts';
import { ExcelExportButton } from '@/components/ExcelExportButton';

export default function StatsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <ExcelExportButton />
      </div>
      <div className="space-y-8">
        <StatsCards />
        <StatsCharts />
      </div>
    </div>
  );
}

import { ProjectsView } from './components/projects-view';
import { UsageAreaChart } from './components/charts/usage-area-chart';
import { DistributionPieChart } from './components/charts/distribution-pie-chart';
import { RequestsBarChart } from './components/charts/requests-bar-chart';

export default function Dashboard() {
  const usageData = [
    { date: '2024-01-01', usage: 400 },
    { date: '2024-01-02', usage: 300 },
    // ... more data
  ];

  const distributionData = [
    { name: 'OpenAI', value: 400 },
    { name: 'Anthropic', value: 300 },
    // ... more data
  ];

  const requestsData = [
    { name: 'Jan', successful: 400, failed: 20 },
    { name: 'Feb', successful: 300, failed: 15 },
    // ... more data
  ];

  return (
    <div className="h-full space-y-6">
      <h1 className="text-3xl font-bold glow-text">SecretAgent.sh Console</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UsageAreaChart
          data={usageData}
          title="API Usage Over Time"
          description="Total API calls per day"
        />
        <DistributionPieChart
          data={distributionData}
          title="API Distribution"
          description="Usage distribution across providers"
        />
        <RequestsBarChart
          data={requestsData}
          title="Request Status"
          description="Successful vs failed requests"
        />
      </div>
      <ProjectsView />
    </div>
  );
}

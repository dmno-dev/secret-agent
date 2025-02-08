import { ProjectsView } from './components/projects-view';

export default function DashboardPage() {
  return (
    <div className="h-full space-y-6">
      {/* <h1 className="text-3xl font-bold glow-text">SecretAgent.sh Console</h1> */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div> */}
      <ProjectsView />
    </div>
  );
}

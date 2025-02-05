import { ProjectsView } from "./components/projects-view";

export default function Dashboard() {
  return (
    <div className="h-full space-y-6">
      <h1 className="text-3xl font-bold glow-text">SecretAgent.sh Console</h1>
      <ProjectsView />
    </div>
  );
}

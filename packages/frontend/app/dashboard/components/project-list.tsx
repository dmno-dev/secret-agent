import { Plus } from "lucide-react";

type Project = {
  id: string;
  name: string;
  address: string;
  balance?: string;
};

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export function ProjectList({
  projects,
  onSelectProject,
  onNewProject,
}: ProjectListProps) {
  return (
    <div className="w-64 border border-green-400 rounded p-4 bg-white dark:bg-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Projects</h2>
        <button
          onClick={onNewProject}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="w-full text-left p-3 border border-gray-200 dark:border-gray-800 rounded hover:border-green-400 dark:hover:border-green-400 transition-colors"
          >
            <div className="font-medium">{project.name}</div>
            <div className="text-sm text-gray-500">
              {project.balance || "0 ETH"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

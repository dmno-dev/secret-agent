import { Project } from "@/lib/types";
import { Plus } from "lucide-react";

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono">Projects</h2>
        <button
          onClick={onNewProject}
          className="p-1 hover:bg-primary/10 rounded transition-colors"
          title="Create new project"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="w-full text-left p-2 hover:bg-primary/10 rounded transition-colors"
          >
            {project.name}
          </button>
        ))}
      </div>
    </div>
  );
}

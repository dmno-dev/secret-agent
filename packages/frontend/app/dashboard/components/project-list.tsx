import { Plus } from "lucide-react";
import { ProjectListItem } from "./project-list-item";

type Project = {
  id: string;
  name: string;
  address: string;
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
          <ProjectListItem
            key={project.id}
            project={project}
            onClick={() => onSelectProject(project)}
          />
        ))}
      </div>
    </div>
  );
}

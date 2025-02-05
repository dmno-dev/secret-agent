import { Plus } from "lucide-react";

export function ProjectList({
  projects,
  onSelectProject,
  onNewProject,
}: {
  projects: { name: string; id: string }[];
  onSelectProject: (project: { name: string; id: string }) => void;
  onNewProject: () => void;
}) {
  return (
    <div className="w-64 border border-gray-300 dark:border-green-400 rounded p-4 bg-white dark:bg-black">
      <h2 className="text-xl font-bold mb-4 glow-text">Projects</h2>
      {projects.length > 0 ? (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-green-800 hover:text-gray-900 dark:hover:text-green-200 p-2 rounded transition-colors"
            >
              {project.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-green-400 mb-4">
          No projects yet. Create one to get started!
        </p>
      )}
      <button
        onClick={onNewProject}
        className="mt-4 w-full border border-gray-300 dark:border-green-400 rounded p-2 flex items-center justify-center space-x-2 hover:bg-gray-100 dark:hover:bg-green-800 hover:text-gray-900 dark:hover:text-green-200 transition-colors"
      >
        <Plus size={16} />
        <span>New Project</span>
      </button>
    </div>
  );
}

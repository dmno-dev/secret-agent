"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectName: string) => void;
}) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(projectName);
    setProjectName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-black border border-gray-300 dark:border-green-400 rounded p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold glow-text">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-700 dark:text-green-400 hover:text-gray-900 dark:hover:text-green-200"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-green-400 border border-gray-300 dark:border-green-400 rounded p-2 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-gray-200 dark:bg-green-800 text-gray-900 dark:text-green-200 rounded p-2 hover:bg-gray-300 dark:hover:bg-green-700 transition-colors"
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}

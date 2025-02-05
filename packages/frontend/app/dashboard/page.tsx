"use client";

import { useEffect, useState } from "react";
import { NewProjectModal } from "./components/new-project-modal";
import { ProjectDetails } from "./components/project-details";
import { ProjectList } from "./components/project-list";

export default function Dashboard() {
  const [projects, setProjects] = useState([
    { id: "0x1234...", name: "AI Assistant", balance: "0.5 ETH" },
    { id: "0x5678...", name: "Data Scraper", balance: "0.2 ETH" },
  ]);
  const [selectedProject, setSelectedProject] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // dumb example just showing we can hit the api and uses dmno to get the url
  useEffect(() => {
    fetch(DMNO_PUBLIC_CONFIG.SECRETAGENT_API_URL).then(async (result) => {
      console.log('hit SA api!', await result.json())
    })
  });  

  return (
    <div className="h-full space-y-6">
      <h1 className="text-3xl font-bold glow-text">SecretAgent.sh Console</h1>
      <div className="flex space-x-6 h-[calc(100%-4rem)]">
        <ProjectList
          projects={projects}
          onSelectProject={(project) => setSelectedProject(project)}
          onNewProject={() => setIsNewProjectModalOpen(true)}
        />
        {selectedProject ? (
          <ProjectDetails project={selectedProject} />
        ) : (
          <div className="flex-1 border border-green-400 rounded p-4 bg-white dark:bg-black">
            Select a project or create a new one to view details.
          </div>
        )}
      </div>
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={(projectName) => {
          const newProject = {
            id: `0x${Math.random().toString(16).slice(2, 10)}...`,
            name: projectName,
            balance: "0 ETH",
          };
          setProjects([...projects, newProject]);
          setIsNewProjectModalOpen(false);
        }}
      />
    </div>
  );
}

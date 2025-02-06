"use client";

import { secretAgentApi } from "@/lib/api";
import { Project } from "@/lib/types";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NewProjectModal } from "./new-project-modal";
import { ProjectDetails } from "./project-details";
import { ProjectList } from "./project-list";
import { ProjectSkeleton } from "./project-skeleton";

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await secretAgentApi.get("projects");
        const data = (await response.json()) as Project[];
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSelectProject = (project: Project) => {
    router.push(`/dashboard?projectId=${project.id}`);
  };

  const handleCreateProject = async (projectName: string) => {
    try {
      setIsLoading(true);

      const response = await secretAgentApi.post("projects", {
        json: {
          name: projectName,
        },
      });

      const newProject = (await response.json()) as Project;
      setProjects((prev) =>
        prev.length === 0 ? [newProject] : [...prev, newProject]
      );
      setIsNewProjectModalOpen(false);
      router.push(`/dashboard?projectId=${newProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100%-4rem)]">
        <div className="text-center space-y-4">
          <div className="text-lg font-mono mb-4">No projects found</div>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create your first project
          </button>
          <NewProjectModal
            isOpen={isNewProjectModalOpen}
            onClose={() => setIsNewProjectModalOpen(false)}
            onCreateProject={handleCreateProject}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-6 h-[calc(100%-4rem)]">
      <ProjectList
        projects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={() => setIsNewProjectModalOpen(true)}
      />
      {selectedProject ? (
        <ProjectDetails project={selectedProject} />
      ) : (
        <div className="flex-1 border border-green-400 rounded p-4 bg-white dark:bg-black">
          Select a project or create a new one to view details.
        </div>
      )}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}

"use client";

import { secretAgentApi } from "@/lib/api";
import { Project } from "@/lib/types";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NewProjectModal } from "./new-project-modal";
import { ProjectCard } from "./project-card";
import { ProjectDetails } from "./project-details";
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

  // Show project details view when a project is selected
  if (selectedProject) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
        <ProjectDetails project={selectedProject} />
      </div>
    );
  }

  // Show projects list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono">Projects</h2>
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-lg font-mono">No projects found</div>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleSelectProject(project)}
            />
          ))}
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

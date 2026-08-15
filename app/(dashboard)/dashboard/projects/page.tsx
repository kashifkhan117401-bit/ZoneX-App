"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FolderPlus,
  FolderOpen,
  Camera,
  Users,
  Clock,
  Trash2,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { getProjectsAction, createProjectAction, deleteProjectAction, type ProjectItem } from "@/lib/actions/projects";

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectType, setNewProjectType] = useState("clothing");
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await getProjectsAction();
    if (res.data) {
      setProjectsList(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name.");
      return;
    }
    setCreating(true);
    const res = await createProjectAction(newProjectName.trim(), newProjectType);
    setCreating(false);
    if (res.success) {
      toast.success("Project created!");
      setShowModal(false);
      setNewProjectName("");
      fetchProjects();
    } else {
      toast.error(res.error ?? "Failed to create project.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"?`)) return;
    const res = await deleteProjectAction(id);
    if (res.success) {
      toast.success("Project deleted.");
      setProjectsList((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast.error(res.error ?? "Failed to delete project.");
    }
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Projects & Collections</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
            Organize and group your generated photoshoots by product line or seasonal drop.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px" }}
        >
          <FolderPlus size={15} /> New Project
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
          Loading projects...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {projectsList.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 20,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 150,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(26,95,248,0.15), rgba(139,92,246,0.10))",
                      border: "1px solid rgba(26,95,248,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FolderOpen size={18} color="var(--brand-400)" />
                  </div>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                    }}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 6px" }}>{p.name}</h3>
              </div>

              <div style={{ display: "flex", gap: 12, fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {p.productType === "clothing" ? <Users size={12} /> : <Camera size={12} />}
                  {p.productType}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} />
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {/* New Project Action Card */}
          <div
            onClick={() => setShowModal(true)}
            className="card"
            style={{
              padding: 20,
              cursor: "pointer",
              border: "1px dashed rgba(255,255,255,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 150,
              textAlign: "center",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(26,95,248,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Plus size={18} color="var(--brand-400)" />
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>Create Project</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
              Group your next photo collection
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: "100%",
              maxWidth: 440,
              padding: 28,
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>New Collection Project</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Project Name
                </label>
                <input
                  className="input-base"
                  placeholder="e.g. Winter Outerwear Drop 2025"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Product Category
                </label>
                <select
                  className="input-base"
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                >
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="cosmetic">Beauty & Cosmetics</option>
                  <option value="gadget">Electronics & Gadgets</option>
                  <option value="accessory">Jewelry & Accessories</option>
                  <option value="home">Home & Living</option>
                  <option value="general">General Product</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary"
                  style={{ padding: "8px 20px", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

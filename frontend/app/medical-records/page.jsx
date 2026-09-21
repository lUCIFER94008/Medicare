"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost, apiDelete } from "../../lib/api";
import { FileText, Plus, Trash2, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/reports/my");
      if (res.success) setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !fileUrl.trim()) {
      return setError("Title and File URL are required.");
    }

    try {
      setSubmitting(true);
      const res = await apiPost("/reports", {
        title,
        description,
        fileUrl,
        fileName: `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      });

      if (res.success) {
        setUploadModalOpen(false);
        setTitle("");
        setDescription("");
        setFileUrl("");
        fetchReports();
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (confirm("Delete this medical record?")) {
      try {
        const res = await apiDelete(`/reports/${id}`);
        if (res.success) fetchReports();
      } catch (err) {
        alert(err.message || "Failed to delete");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "100vh", padding: "48px 0" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 className="heading-lg" style={{ fontSize: "1.75rem" }}>
              Medical Records & Lab Reports
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Store, view, and share your diagnostic lab reports and medical history securely.
            </p>
          </div>
          <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Upload New Report
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading medical records...</p>
        ) : reports.length === 0 ? (
          <div className="card-base" style={{ padding: "48px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
            <FileText size={48} style={{ color: "var(--text-light)", marginBottom: "16px" }} />
            <h3>No Medical Reports Uploaded</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              Upload your lab test results, blood work, or clinical scan reports.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {reports.map((report) => (
              <div key={report._id} className="card-base" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "var(--secondary)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{report.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Uploaded {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "20px", lineHeight: "1.5" }}>
                  {report.description || "No description provided."}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a href={report.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                    <ExternalLink size={14} /> View File
                  </a>
                  <button onClick={() => handleDeleteReport(report._id)} style={{ color: "#DC2626", padding: "6px" }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="card-base" style={{ width: "100%", maxWidth: "480px", padding: "32px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Upload Medical Report</h3>
              <button onClick={() => setUploadModalOpen(false)}>✕</button>
            </div>

            {error && <div style={{ backgroundColor: "#FEF2F2", color: "#991B1B", padding: "10px", borderRadius: "6px", marginBottom: "12px", fontSize: "0.85rem" }}>{error}</div>}

            <form onSubmit={handleUploadReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px", display: "block" }}>Report Title *</label>
                <input type="text" required placeholder="e.g. Blood Test Diagnostic Report" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px", display: "block" }}>File Document URL *</label>
                <input type="url" required placeholder="https://example.com/reports/document.pdf" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px", display: "block" }}>Description</label>
                <textarea rows={2} placeholder="Optional notes for doctor review..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setUploadModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>{submitting ? "Uploading..." : "Save Record"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

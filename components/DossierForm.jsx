"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function DossierForm({ onSubmit, generating, dossierType }) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [errors, setErrors] = useState({});
  const [shaking, setShaking] = useState(false);

  const showCompany = dossierType === "company" || dossierType === "jd" || dossierType === "news" || dossierType === "resume";
  const showCompanyRequired = dossierType === "company" || dossierType === "jd" || dossierType === "news";
  const showRole = dossierType === "role" || dossierType === "jd" || dossierType === "news" || dossierType === "resume";
  const showRoleRequired = dossierType === "role" || dossierType === "jd" || dossierType === "resume";
  const showJD = dossierType === "jd" || dossierType === "resume";
  const showResume = dossierType === "resume";

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported. For other formats, please copy-paste the text.");
      return;
    }

    setParsing(true);
    const toastId = toast.loading("Extracting text from resume...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to parse PDF");
      }

      const data = await res.json();
      setResumeText(data.text);
      toast.success("Resume text extracted successfully!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to parse PDF", { id: toastId });
    } finally {
      setParsing(false);
    }
  }

  function validate() {
    const newErrors = {};

    if (showCompanyRequired && !companyName.trim()) {
      newErrors.companyName = "Required";
    } else if (companyName.trim().length > 100) {
      newErrors.companyName = "Max 100 characters";
    }

    if (showRoleRequired && !role.trim()) {
      newErrors.role = "Required";
    } else if (role.trim().length > 100) {
      newErrors.role = "Max 100 characters";
    }

    if (showJD) {
      if (!jobDescription.trim()) {
        newErrors.jobDescription = "Required";
      } else if (jobDescription.trim().length < 200) {
        newErrors.jobDescription = `Need at least 200 characters (currently ${jobDescription.trim().length})`;
      } else if (jobDescription.length > 10000) {
        newErrors.jobDescription = "Max 10,000 characters";
      }
    }

    if (showResume) {
      if (!resumeText.trim()) {
        newErrors.resumeText = "Required";
      } else if (resumeText.trim().length < 100) {
        newErrors.resumeText = `Resume must be at least 100 characters (currently ${resumeText.trim().length})`;
      } else if (resumeText.length > 50000) {
        newErrors.resumeText = "Max 50,000 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      toast.error("Please fix the errors before submitting.");
      return;
    }
    onSubmit({
      companyName: companyName.trim(),
      role: role.trim(),
      jobDescription: jobDescription.trim(),
      resumeText: resumeText.trim(),
    });
  }

  const jdCharCount = jobDescription.trim().length;
  const resumeCharCount = resumeText.trim().length;

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${shaking ? "animate-shake" : ""}`}>
      {/* Company Name */}
      {showCompany && (
        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-slate-300 mb-1">
            Company Name
            {showCompanyRequired ? <span className="text-red-400"> *</span> : <span className="text-slate-500 font-normal"> (optional)</span>}
          </label>
          <div className="relative">
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Tesla, Zomato"
              maxLength={100}
              disabled={generating}
              className={`w-full pl-4 pr-4 py-3 rounded-lg border bg-[#0B0F19]/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.companyName
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-white/[0.08] focus:ring-[#F28C28]/20 focus:border-[#F28C28]/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.companyName && (
              <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
            )}
          </div>
        </div>
      )}

      {/* Role */}
      {showRole && (
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-slate-300 mb-1">
            Role Title
            {showRoleRequired ? <span className="text-red-400"> *</span> : <span className="text-slate-500 font-normal"> (optional)</span>}
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Product Manager, Strategy Consultant"
            maxLength={100}
            disabled={generating}
            className={`w-full px-4 py-3 rounded-lg border bg-[#0B0F19]/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.role
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-white/[0.08] focus:ring-[#F28C28]/20 focus:border-[#F28C28]/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
        </div>
      )}

      {/* Resume Input */}
      {showResume && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Upload Resume (PDF)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#0B0F19]/40 border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500">PDF formats only (Max 10MB)</p>
                </div>
                <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={generating || parsing} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="resumeText" className="block text-sm font-semibold text-slate-300 mb-1">
              Or Paste Resume Text <span className="text-red-400">*</span>
            </label>
            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your raw resume text here..."
              rows={6}
              maxLength={50000}
              disabled={generating || parsing}
              className={`w-full px-4 py-3 rounded-lg border bg-[#0B0F19]/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 resize-y ${
                errors.resumeText
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-white/[0.08] focus:ring-[#F28C28]/20 focus:border-[#F28C28]/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.resumeText ? (
                <p className="text-red-400 text-xs">{errors.resumeText}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${resumeCharCount < 100 ? "text-red-400" : "text-slate-500"}`}>
                {resumeCharCount} / 50,000
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Job Description */}
      {showJD && (
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-semibold text-slate-300 mb-1">
            Job Description <span className="text-red-400">*</span>
            <span className="text-slate-500 font-normal ml-2">(200–10,000 characters)</span>
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            maxLength={10000}
            disabled={generating}
            className={`w-full px-4 py-3 rounded-lg border bg-[#0B0F19]/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 resize-y ${
              errors.jobDescription
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-white/[0.08] focus:ring-[#F28C28]/20 focus:border-[#F28C28]/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.jobDescription ? (
              <p className="text-red-400 text-xs">{errors.jobDescription}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${jdCharCount < 200 ? "text-red-400" : jdCharCount > 9000 ? "text-amber-400" : "text-slate-500"}`}>
              {jdCharCount} / 10,000
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={generating}
        className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-[#F28C28] hover:bg-[#E07E1F] disabled:bg-slate-800 text-[#030712] font-bold text-base transition-all duration-200 shadow-[0_4px_12px_rgba(242,140,40,0.2)] hover:shadow-[0_4px_20px_rgba(242,140,40,0.35)] hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:cursor-not-allowed disabled:text-slate-500"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating your dossier...
          </span>
        ) : (
          "Generate Dossier"
        )}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function DossierForm({ onSubmit, generating, dossierType }) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [shaking, setShaking] = useState(false);

  const showCompany = dossierType === "company" || dossierType === "jd" || dossierType === "news";
  const showCompanyRequired = dossierType === "company" || dossierType === "jd" || dossierType === "news";
  const showRole = dossierType === "role" || dossierType === "jd" || dossierType === "news";
  const showRoleRequired = dossierType === "role" || dossierType === "jd";
  const showJD = dossierType === "jd";

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

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
    });
  }

  const jdCharCount = jobDescription.trim().length;

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

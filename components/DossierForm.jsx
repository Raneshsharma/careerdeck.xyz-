"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function DossierForm({ onSubmit, generating, dossierType }) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [errors, setErrors] = useState({});

  const showCompany = dossierType === "company" || dossierType === "jd" || dossierType === "news";
  const showCompanyRequired = dossierType === "company" || dossierType === "jd" || dossierType === "news";
  const showRole = dossierType === "role" || dossierType === "jd" || dossierType === "news";
  const showRoleRequired = dossierType === "role" || dossierType === "jd";
  const showJD = dossierType === "jd";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Company Name */}
      {showCompany && (
        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-1">
            Company Name
            {showCompanyRequired ? <span className="text-red-500"> *</span> : <span className="text-gray-400 font-normal"> (optional)</span>}
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Stripe, Tesla, Zomato"
            maxLength={100}
            disabled={generating}
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
              errors.companyName
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-brand-400 focus:border-brand-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
        </div>
      )}

      {/* Role */}
      {showRole && (
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
            Role Title
            {showRoleRequired ? <span className="text-red-500"> *</span> : <span className="text-gray-400 font-normal"> (optional — adds role relevance)</span>}
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Product Manager, Strategy Consultant, Data Analyst"
            maxLength={100}
            disabled={generating}
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
              errors.role
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-brand-400 focus:border-brand-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>
      )}

      {/* Job Description */}
      {showJD && (
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-700 mb-1">
            Job Description <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-2">(200–10,000 characters)</span>
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            maxLength={10000}
            disabled={generating}
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition resize-y ${
              errors.jobDescription
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-brand-400 focus:border-brand-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.jobDescription ? (
              <p className="text-red-500 text-xs">{errors.jobDescription}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${jdCharCount < 200 ? "text-red-400" : jdCharCount > 9000 ? "text-amber-500" : "text-gray-400"}`}>
              {jdCharCount} / 10,000
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={generating}
        className="w-full py-3.5 px-6 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold text-lg transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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

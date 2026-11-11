import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { useAuth } from '../context/AuthContext.js';
import {
  User,
  Upload,
  Trash2,
  Plus,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Sparkles,
} from 'lucide-react';
import { ProjectItem, CertificationItem } from '../types.js';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, updateAvatar, token } = useAuth();
  const [searchParams] = useSearchParams();
  const isNewUser = searchParams.get('new') === 'true';

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [degree, setDegree] = useState(profile?.degree || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [academicYear, setAcademicYear] = useState(profile?.academic_year || 'Final Year (4th Year)');
  const [careerObjective, setCareerObjective] = useState(profile?.career_objective || '');
  const [preferredJobRole, setPreferredJobRole] = useState(profile?.preferred_job_role || 'Full Stack Developer');
  const [workExperience, setWorkExperience] = useState(profile?.work_experience || '');

  // Skills & Languages
  const [technicalSkills, setTechnicalSkills] = useState<string[]>(profile?.technical_skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(profile?.programming_languages || []);
  const [newLanguageInput, setNewLanguageInput] = useState('');

  // Projects & Certifications
  const [projects, setProjects] = useState<ProjectItem[]>(profile?.projects || []);
  const [certifications, setCertifications] = useState<CertificationItem[]>(profile?.certifications || []);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume auto-parser state
  const [resumeText, setResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParsedSuccess, setResumeParsedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setCollege(profile.college || '');
      setDegree(profile.degree || '');
      setDepartment(profile.department || '');
      setAcademicYear(profile.academic_year || 'Final Year (4th Year)');
      setCareerObjective(profile.career_objective || '');
      setPreferredJobRole(profile.preferred_job_role || 'Full Stack Developer');
      setWorkExperience(profile.work_experience || '');
      setTechnicalSkills(profile.technical_skills || []);
      setProgrammingLanguages(profile.programming_languages || []);
      setProjects(profile.projects || []);
      setCertifications(profile.certifications || []);
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Handle avatar upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
      try {
        await updateAvatar(base64);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to update avatar image.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    try {
      await updateAvatar('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove avatar.');
    }
  };

  // Add & remove skill
  const handleAddSkill = () => {
    const skill = newSkillInput.trim();
    if (skill && !technicalSkills.includes(skill)) {
      setTechnicalSkills([...technicalSkills, skill]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTechnicalSkills(technicalSkills.filter(s => s !== skillToRemove));
  };

  // Add & remove language
  const handleAddLanguage = () => {
    const lang = newLanguageInput.trim();
    if (lang && !programmingLanguages.includes(lang)) {
      setProgrammingLanguages([...programmingLanguages, lang]);
      setNewLanguageInput('');
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setProgrammingLanguages(programmingLanguages.filter(l => l !== langToRemove));
  };

  // Projects
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: 'proj_' + Date.now(),
      title: 'New Project',
      description: 'Describe what problem this project solved and your key contribution.',
      tech_stack: 'React, Node.js',
      link: '',
    };
    setProjects([...projects, newProj]);
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, val: string) => {
    setProjects(projects.map(p => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Certifications
  const handleAddCertification = () => {
    const newCert: CertificationItem = {
      id: 'cert_' + Date.now(),
      name: 'Certification Name',
      issuer: 'Issuing Organization',
      year: new Date().getFullYear().toString(),
    };
    setCertifications([...certifications, newCert]);
  };

  const handleUpdateCert = (id: string, field: keyof CertificationItem, val: string) => {
    setCertifications(certifications.map(c => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const handleRemoveCert = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id));
  };

  // AI Resume Auto-fill
  const handleAutoFillFromResume = async () => {
    if (!resumeText.trim() || resumeText.length < 20) {
      setErrorMessage('Please paste your resume text to extract skills.');
      return;
    }

    setIsParsingResume(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to parse resume');

      const data = json.data;
      if (data.skills?.length) {
        setTechnicalSkills(prev => Array.from(new Set([...prev, ...data.skills])));
      }
      if (data.programmingLanguages?.length) {
        setProgrammingLanguages(prev => Array.from(new Set([...prev, ...data.programmingLanguages])));
      }
      if (data.education?.college) setCollege(data.education.college);
      if (data.education?.degree) setDegree(data.education.degree);
      if (data.education?.department) setDepartment(data.education.department);
      if (data.suggestedRole) setPreferredJobRole(data.suggestedRole);
      if (data.experienceSummary) setWorkExperience(data.experienceSummary);

      setResumeParsedSuccess(true);
      setTimeout(() => setResumeParsedSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to auto-parse resume.');
    } finally {
      setIsParsingResume(false);
    }
  };

  // Save all profile information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      await updateProfile({
        full_name: fullName,
        phone,
        college,
        degree,
        department,
        academic_year: academicYear,
        career_objective: careerObjective,
        preferred_job_role: preferredJobRole,
        work_experience: workExperience,
        technical_skills: technicalSkills,
        programming_languages: programmingLanguages,
        projects,
        certifications,
        avatar_url: avatarUrl,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Top notification banner for new registration */}
        {isNewUser && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-blue-900 dark:text-blue-200">Welcome to PrepPulse AI!</p>
              <p className="text-blue-700 dark:text-blue-300">
                Complete your college and skill details below so our AI interviewer can customize questions specifically to your profile.
              </p>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 text-sm font-semibold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Profile information saved and synchronized successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center gap-2.5 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* SECTION 1: PROFILE PICTURE & BASIC IDENTITY */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Information & Avatar</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              {/* Avatar display */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md overflow-hidden flex items-center justify-center text-slate-400">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
              </div>

              {/* Avatar controls */}
              <div className="space-y-2 text-center sm:text-left">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recommended size: square JPG or PNG, max 5MB.
                </p>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Preferred Job Role *
                </label>
                <input
                  type="text"
                  required
                  value={preferredJobRole}
                  onChange={(e) => setPreferredJobRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Data Analyst"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Career Objective
              </label>
              <textarea
                rows={3}
                value={careerObjective}
                onChange={(e) => setCareerObjective(e.target.value)}
                placeholder="Briefly describe your career aspirations, target companies, or domains of interest..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SECTION 2: ACADEMICS & EDUCATION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>College & Academic Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  College / University Name
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. State University of Technology"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Degree
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Technology (B.Tech) / B.S."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="Final Year (4th Year)">Final Year (Senior)</option>
                  <option value="Recent Graduate">Recent Graduate</option>
                  <option value="Master's Student">Master's Student</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: TECHNICAL SKILLS & LANGUAGES */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-600" />
              <span>Skills & Technologies</span>
            </h2>

            {/* Technical Skills */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Technical Frameworks & Tools
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Type a skill (e.g. React, Docker, PostgreSQL) and press Enter"
                  className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-800 dark:text-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {technicalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Programming Languages */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Programming Languages
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguageInput}
                  onChange={(e) => setNewLanguageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                  placeholder="Type a language (e.g. TypeScript, Python, Java) and press Enter"
                  className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-800 dark:text-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {programmingLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: PROJECTS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <span>Featured Projects</span>
              </h2>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                      placeholder="Project Title"
                      className="font-bold text-sm bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={proj.tech_stack}
                    onChange={(e) => handleUpdateProject(proj.id, 'tech_stack', e.target.value)}
                    placeholder="Tech Stack (e.g. React, Node.js, PostgreSQL)"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                    placeholder="Key problem solved, metrics or architecture..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: CERTIFICATIONS & WORK EXPERIENCE */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Certifications & Work Experience</span>
              </h2>
              <button
                type="button"
                onClick={handleAddCertification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>

            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
                >
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleUpdateCert(cert.id, 'name', e.target.value)}
                    placeholder="Certification Name (e.g. AWS Certified Developer)"
                    className="flex-1 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleUpdateCert(cert.id, 'issuer', e.target.value)}
                    placeholder="Issuer (e.g. AWS, Meta)"
                    className="w-32 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={cert.year}
                    onChange={(e) => handleUpdateCert(cert.id, 'year', e.target.value)}
                    placeholder="Year"
                    className="w-20 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(cert.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Work Experience or Internships
              </label>
              <textarea
                rows={3}
                value={workExperience}
                onChange={(e) => setWorkExperience(e.target.value)}
                placeholder="Details of previous internships, freelance work, or open source contributions..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SECTION 6: RESUME AI EXTRACTION TOOL */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-blue-200 dark:border-blue-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Fast-Track: AI Resume Parser
                </h3>
              </div>
              {resumeParsedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Auto-filled!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Paste the plain text of your resume or CV below. Our Gemini engine will automatically extract your technical skills, education, and projects to populate your profile.
            </p>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume contents here..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
            />
            <button
              type="button"
              disabled={isParsingResume || !resumeText.trim()}
              onClick={handleAutoFillFromResume}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsingResume ? 'Extracting Resume Data...' : 'Extract & Pre-fill Profile'}</span>
            </button>
          </div>

          {/* STICKY BOTTOM SAVE BUTTON */}
          <div className="sticky bottom-6 z-20 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

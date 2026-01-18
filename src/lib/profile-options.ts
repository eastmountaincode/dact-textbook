// Centralized profile options for forms and analytics
// Used in: signup, account settings, textbook analytics filters

export interface ProfileOption {
  value: string;
  label: string;
}

// Role options (student, professional, educator, etc.)
export const ROLE_OPTIONS: ProfileOption[] = [
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'educator', label: 'Educator' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'self_learner', label: 'Self-learner' },
  { value: 'other', label: 'Other' },
];

// Highest or current level of education options
export const EDUCATION_OPTIONS: ProfileOption[] = [
  { value: 'high_school', label: 'High School' },
  { value: 'undergraduate', label: "Bachelor's Degree" },
  { value: 'graduate', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];

// Field of study options
export const FIELD_OPTIONS: ProfileOption[] = [
  { value: 'economics', label: 'Economics' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'business', label: 'Business' },
  { value: 'social_sciences', label: 'Social Sciences' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'health_medicine', label: 'Health / Medicine' },
  { value: 'law', label: 'Law' },
  { value: 'education', label: 'Education' },
  { value: 'art_humanities', label: 'Art / Humanities' },
  { value: 'other', label: 'Other' },
];

// Institution type options
export const INSTITUTION_OPTIONS: ProfileOption[] = [
  { value: 'university', label: 'University' },
  { value: 'community_college', label: 'Community College' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
  { value: 'self_study', label: 'Self-study' },
  { value: 'other', label: 'Other' },
];

// Statistics use options (What do you plan to use statistics for?)
export const STATISTICS_USE_OPTIONS: ProfileOption[] = [
  { value: 'academic_coursework', label: 'Academic Coursework' },
  { value: 'research', label: 'Research' },
  { value: 'professional_work', label: 'Professional / Work Projects' },
  { value: 'personal_projects', label: 'Personal Projects' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'other', label: 'Other' },
];

// Referral source options
export const REFERRAL_OPTIONS: ProfileOption[] = [
  { value: 'search_engine', label: 'Search Engine' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'professor', label: 'Professor' },
  { value: 'online_course', label: 'Online Course' },
  { value: 'other', label: 'Other' },
];

// Helper to get label for a value
export function getOptionLabel(options: ProfileOption[], value: string): string {
  return options.find(opt => opt.value === value)?.label || value;
}

// Helper to get sort order for education levels (by academic progression)
// Returns index in EDUCATION_OPTIONS array, or a high number for unknown values
export function getEducationOrder(value: string): number {
  const index = EDUCATION_OPTIONS.findIndex(opt => opt.value === value);
  return index >= 0 ? index : EDUCATION_OPTIONS.length;
}

// For forms: prepend a placeholder option
export function withPlaceholder(options: ProfileOption[], placeholder: string): ProfileOption[] {
  return [{ value: '', label: placeholder }, ...options];
}

export const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'nonbinary', label: 'Nonbinary' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const SCHOOL_OPTIONS = [
  { id: 'NTNU', label: 'NTNU' },
  { id: 'BI', label: 'BI' },
  { id: 'Other', label: 'Other' },
];

export const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'norwegian', label: 'Norwegian' },
];

export const YEARS_OF_STUDY = [
  { id: 'year_1', label: 'Year 1' },
  { id: 'year_2', label: 'Year 2' },
  { id: 'year_3', label: 'Year 3' },
  { id: 'year_4', label: 'Year 4' },
  { id: 'year_5', label: 'Year 5' },
  { id: 'year_6_plus', label: 'Year 6+' },
  { id: 'phd', label: 'PhD' },
  { id: 'other', label: 'Other' },
];

export const INTERESTS = [
  { id: 'Café', label: 'Café' },
  { id: 'Study', label: 'Study' },
  { id: 'Concert', label: 'Concert' },
  { id: 'Food', label: 'Food' },
  { id: 'Outdoors', label: 'Outdoors' },
  { id: 'Party', label: 'Party' },
  { id: 'Other', label: 'Other' },
];

export const emptyProfileForm = {
  firstName: '',
  lastName: '',
  gender: 'prefer_not_to_say',
  age: '',
  studyProgramme: '',
  yearOfStudy: '',
  schoolOption: 'NTNU',
  schoolName: '',
  languages: ['english'],
  interests: [],
};

export function profileToForm(profile) {
  if (!profile) return { ...emptyProfileForm };
  return {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    gender: profile.gender || 'prefer_not_to_say',
    age: String(profile.age ?? ''),
    studyProgramme: profile.study_programme || '',
    yearOfStudy: profile.year_of_study || '',
    schoolOption: profile.school_option || 'NTNU',
    schoolName: profile.school_option === 'Other' ? (profile.school_name || '') : '',
    languages: profile.languages || ['english'],
    interests: profile.interests || [],
  };
}

export function validateProfile(values) {
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const programme = values.studyProgramme.trim();
  const age = Number(values.age);
  if (!firstName || firstName.length > 80) return 'Add a first name up to 80 characters.';
  if (!lastName || lastName.length > 80) return 'Add a last name up to 80 characters.';
  if (!GENDERS.some(item => item.id === values.gender)) return 'Choose a gender option, or Prefer not to say.';
  if (!Number.isInteger(age) || age < 16 || age > 120) return 'Age must be a whole number from 16 to 120.';
  if (!programme || programme.length > 120) return 'Add your study programme.';
  if (!YEARS_OF_STUDY.some(item => item.id === values.yearOfStudy)) return 'Choose your year of study.';
  if (!SCHOOL_OPTIONS.some(item => item.id === values.schoolOption)) return 'Choose a school.';
  if (values.schoolOption === 'Other') {
    const custom = values.schoolName.trim();
    if (!custom || custom.length > 120) return 'Add your school name.';
  }
  if (!values.languages.length) return 'Choose at least one preferred language.';
  if (values.languages.some(item => !LANGUAGES.some(option => option.id === item))) {
    return 'Choose English and/or Norwegian.';
  }
  if (!values.interests.length) return 'Choose at least one interest.';
  if (values.interests.some(item => !INTERESTS.some(option => option.id === item))) {
    return 'Choose interests from the list.';
  }
  return null;
}

export function profilePayload(values) {
  const schoolName = values.schoolOption === 'Other' ? values.schoolName.trim() : values.schoolOption;
  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    gender: values.gender,
    age: Number(values.age),
    study_programme: values.studyProgramme.trim(),
    year_of_study: values.yearOfStudy,
    school_option: values.schoolOption,
    school_name: schoolName,
    city: 'Trondheim',
    languages: values.languages,
    interests: values.interests,
  };
}

export function genderLabel(value) {
  return GENDERS.find(item => item.id === value)?.label || 'Prefer not to say';
}

export function yearOfStudyLabel(value) {
  return YEARS_OF_STUDY.find(item => item.id === value)?.label || '';
}

export async function getMyProfile(api) {
  try {
    return await api('/profiles/me');
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

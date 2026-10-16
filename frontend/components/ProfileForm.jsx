import ChoiceGroup from './ChoiceGroup';
import ProgrammeSuggest from './ProgrammeSuggest';
import { GENDERS, INTERESTS, LANGUAGES, SCHOOL_OPTIONS, YEARS_OF_STUDY } from '../lib/profileFields';

export default function ProfileForm({ values, busy, submitLabel, onChange, onSubmit }) {
  function set(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <form className="rounded-2xl bg-white p-6 shadow-sm" onSubmit={onSubmit}>
      <label className="block text-sm font-semibold text-[#32251F]">
        First name
        <input
          required
          maxLength={80}
          value={values.firstName}
          onChange={e => set('firstName', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Last name
        <input
          required
          maxLength={80}
          value={values.lastName}
          onChange={e => set('lastName', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <ChoiceGroup
        legend="Gender"
        name="gender"
        options={GENDERS}
        value={values.gender}
        onChange={id => set('gender', id)}
        describedBy="gender-help"
      />
      <p id="gender-help" className="mt-2 text-sm text-[#6B5348]">
        Use Prefer not to say if you do not want to share this. Hello Club does not verify gender and does not guess it from your name.
      </p>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Age
        <span className="mt-1 block font-normal text-sm text-[#6B5348]">Whole years. We do not collect a birth date.</span>
        <input
          required
          type="number"
          min={16}
          max={120}
          step={1}
          value={values.age}
          onChange={e => set('age', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <div className="mt-4">
        <ProgrammeSuggest
          value={values.studyProgramme}
          onChange={value => set('studyProgramme', value)}
        />
      </div>
      <ChoiceGroup
        legend="Year of study"
        name="yearOfStudy"
        options={YEARS_OF_STUDY}
        value={values.yearOfStudy}
        onChange={id => set('yearOfStudy', id)}
      />
      <ChoiceGroup
        legend="School"
        name="schoolOption"
        options={SCHOOL_OPTIONS}
        value={values.schoolOption}
        onChange={id => set('schoolOption', id)}
      />
      {values.schoolOption === 'Other' ? (
        <label className="mt-3 block text-sm font-semibold text-[#32251F]">
          School name
          <input
            required
            maxLength={120}
            value={values.schoolName}
            onChange={e => set('schoolName', e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
          />
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        City
        <input
          readOnly
          value="Trondheim"
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <ChoiceGroup
        legend="Preferred activity languages"
        name="languages"
        options={LANGUAGES}
        value={values.languages}
        onChange={next => set('languages', next)}
        multiple
        describedBy="language-help"
      />
      <p id="language-help" className="mt-2 text-sm text-[#6B5348]">
        Select one or both. Both means you are happy using English and Norwegian.
      </p>
      <ChoiceGroup
        legend="Interests"
        name="interests"
        options={INTERESTS}
        value={values.interests}
        onChange={next => set('interests', next)}
        multiple
        describedBy="interest-help"
      />
      <p id="interest-help" className="mt-2 text-sm text-[#6B5348]">
        Saved for your profile. For You is not a personalised ranking yet.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-[#C2410C] p-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

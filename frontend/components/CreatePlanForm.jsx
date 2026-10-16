import ChoiceGroup from './ChoiceGroup';
import { AUDIENCE_OPTIONS, GUEST_PRESETS, MAX_GUESTS, guestHelperText, guestLimitFromPreset } from '../lib/planCapacity';

export default function CreatePlanForm({
  values,
  minDateTime,
  busy,
  onChange,
  onSubmit,
}) {
  function set(field, value) {
    onChange({ ...values, [field]: value });
  }

  function setGuestPreset(presetId) {
    const preset = GUEST_PRESETS.find(item => item.id === presetId);
    const mapped = preset?.guests;
    onChange({
      ...values,
      guestPreset: presetId,
      guestLimit: mapped != null ? String(mapped) : presetId === '10+' ? '10' : '1',
    });
  }

  const guestLimit = guestLimitFromPreset(values.guestPreset, values.guestLimit);
  const needsExact = values.guestPreset === '10+' || values.guestPreset === 'custom';
  const helperId = 'guest-capacity-help';
  const audienceHelpId = 'audience-preference-help';

  return (
    <form className="rounded-2xl bg-white p-6 shadow-sm" onSubmit={onSubmit}>
      <label className="block text-sm font-semibold text-[#32251F]">
        Title
        <input
          required
          maxLength={120}
          value={values.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Coffee and a chat ☕️"
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Category
        <select
          required
          value={values.category}
          onChange={e => set('category', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        >
          <option value="">Choose a category</option>
          {['Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other'].map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Public meeting place
        <input
          required
          maxLength={200}
          value={values.place}
          onChange={e => set('place', e.target.value)}
          placeholder="Realfagbygget, main foyer"
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Date and time
        <span className="mt-1 block font-normal text-sm text-[#6B5348]">Trondheim time (Europe/Oslo)</span>
        <input
          required
          type="datetime-local"
          min={minDateTime}
          value={values.startsAt}
          onChange={e => set('startsAt', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <ChoiceGroup
        legend="How many people can join you?"
        name="guestPreset"
        options={GUEST_PRESETS}
        value={values.guestPreset}
        onChange={setGuestPreset}
        describedBy={helperId}
      />
      {needsExact ? (
        <label className="mt-3 block text-sm font-semibold text-[#32251F]">
          Exact guest limit
          <input
            required
            type="number"
            min={values.guestPreset === '10+' ? 10 : 1}
            max={MAX_GUESTS}
            step={1}
            value={values.guestLimit}
            onChange={e => set('guestLimit', e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
          />
        </label>
      ) : null}
      <p id={helperId} className="mt-2 text-sm font-normal text-[#6B5348]">
        {guestLimit ? guestHelperText(guestLimit) : needsExact
          ? values.guestPreset === '10+'
            ? 'Enter an exact guest limit from 10 to 49.'
            : 'Enter an exact guest limit from 1 to 49.'
          : 'Guests do not include you. Total size stays at most 50.'}
      </p>
      <ChoiceGroup
        legend="Who can join?"
        name="audiencePreference"
        options={AUDIENCE_OPTIONS}
        value={values.audiencePreference}
        onChange={id => set('audiencePreference', id)}
        describedBy={audienceHelpId}
      />
      <p id={audienceHelpId} className="mt-2 text-sm font-normal text-[#6B5348]">
        This is your preference. Hello Club does not verify gender here.
      </p>
      <label className="mt-4 block text-sm font-semibold text-[#32251F]">
        Short description <span className="font-normal text-[#6B5348]">(optional)</span>
        <textarea
          maxLength={500}
          rows={4}
          value={values.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Bring a laptop and your notes."
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-[#C2410C] p-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Create plan'}
      </button>
    </form>
  );
}

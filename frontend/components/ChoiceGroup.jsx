export default function ChoiceGroup({ legend, name, options, value, onChange, describedBy, multiple = false }) {
  function selected(id) {
    return multiple ? value.includes(id) : value === id;
  }

  function onKeyDown(event) {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!move) return;
    event.preventDefault();
    const index = Math.max(0, options.findIndex(option => selected(option.id)));
    const next = options[(index + move + options.length) % options.length];
    toggle(next.id);
    const target = event.currentTarget.querySelector(`[data-choice-id="${next.id}"]`);
    target?.focus();
  }

  function toggle(id) {
    if (!multiple) {
      onChange(id);
      return;
    }
    onChange(value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
  }

  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-semibold text-[#32251F]">{legend}</legend>
      <div
        role={multiple ? 'group' : 'radiogroup'}
        aria-label={legend}
        aria-describedby={describedBy}
        className="mt-2 flex flex-wrap gap-2"
        onKeyDown={onKeyDown}
      >
        {options.map((option, index) => {
          const isOn = selected(option.id);
          const tabbable = multiple || isOn || (!value && index === 0);
          return (
            <button
              key={option.id}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              name={name}
              data-choice-id={option.id}
              aria-checked={isOn}
              tabIndex={tabbable ? 0 : -1}
              className="hello-choice"
              onClick={() => toggle(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

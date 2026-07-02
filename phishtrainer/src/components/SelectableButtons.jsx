function SelectableButtons({ options, selected, onSelect, ariaLabel, className }) {
  return (
    <div className={className} aria-label={ariaLabel}>
      {options.map((option) => {
        const label = typeof option === 'string' ? option : option.label;
        const value = typeof option === 'string' ? option : option.value;
        const className = typeof option === 'string' ? label : value;
        const optionClass = `option-${className.toLowerCase().replace(/\s+/g, '-')}`;

        return (
          <button
            className={`${optionClass} ${selected === value ? 'is-selected' : ''}`}
            key={value}
            onClick={() => onSelect(value, option)}
            type="button"
          >
            {label}
            {option.recommended && <span className="recommended-tag">For you</span>}
          </button>
        );
      })}
    </div>
  );
}

export default SelectableButtons;

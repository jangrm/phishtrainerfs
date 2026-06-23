function SelectableButtons({ options, selected, onSelect, ariaLabel, className }) {
  return (
    <div className={className} aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          className={selected === option ? 'is-selected' : ''}
          key={option}
          onClick={() => onSelect(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default SelectableButtons;

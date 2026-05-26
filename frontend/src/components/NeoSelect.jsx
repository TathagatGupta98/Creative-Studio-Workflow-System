import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function NeoSelect({ value, onChange, options, placeholder, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between neo-input neo-radius-none bg-white pr-10 cursor-pointer hover:bg-[var(--neo-surface-high)] transition-all select-none"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
      </div>

      {/* Icon Overlay */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none border-l-2 border-[var(--neo-border)] bg-[var(--neo-yellow)]">
        <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Options List */}
      {isOpen && (
        <div className="absolute z-[100] left-0 right-0 mt-2 bg-white neo-border-thick neo-shadow animate-in fade-in zoom-in duration-150 max-h-[300px] overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`px-4 py-3 neo-label-sm cursor-pointer border-b-2 border-[var(--neo-border)] last:border-b-0 transition-colors
                ${String(value) === String(opt.value) 
                  ? 'bg-[var(--neo-blue)] text-white' 
                  : 'hover:bg-[var(--neo-yellow)] text-[var(--neo-text)]'
                }`}
            >
              {opt.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-3 text-[var(--neo-text-muted)] italic">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

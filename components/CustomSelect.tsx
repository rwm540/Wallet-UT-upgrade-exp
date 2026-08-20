
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ASSET_CONFIG } from '../constants';

interface Option {
  id: string;
  name: string;
  symbol?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  dir?: 'ltr' | 'rtl';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, dir = 'ltr' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef} dir={dir}>
      {label && <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-blue-400 transition-all shadow-sm ${isOpen ? 'ring-2 ring-blue-100 border-blue-500' : ''}`}
      >
        <div className="flex items-center gap-3">
          {selectedOption && ASSET_CONFIG[selectedOption.id as keyof typeof ASSET_CONFIG] && (
            <div 
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: ASSET_CONFIG[selectedOption.id as keyof typeof ASSET_CONFIG].color }}
            >
              {selectedOption.symbol || selectedOption.id}
            </div>
          )}
          <span className="font-bold text-slate-800 text-sm">
            {selectedOption?.name} {selectedOption?.symbol ? `(${selectedOption.symbol})` : ''}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${value === option.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {ASSET_CONFIG[option.id as keyof typeof ASSET_CONFIG] && (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: ASSET_CONFIG[option.id as keyof typeof ASSET_CONFIG].color }}
                    >
                      {option.symbol || option.id}
                    </div>
                  )}
                  <div className="text-start">
                    <p className={`text-sm font-bold ${value === option.id ? 'text-blue-600' : 'text-slate-700'}`}>{option.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{option.id}</p>
                  </div>
                </div>
                {value === option.id && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

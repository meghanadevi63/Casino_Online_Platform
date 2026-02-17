import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

const SearchableSelect = ({ options, onSelect, placeholder, label, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  // Filter options based on search
  const filtered = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find current label for display
  const currentLabel = options.find(opt => opt.value === value)?.label || "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-yellow-500/50 transition-all text-sm text-white"
      >
        <span className={currentLabel ? "text-white" : "text-gray-500"}>
          {currentLabel || placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                autoFocus
                className="w-full bg-black border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-yellow-500"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filtered.map((opt) => (
              <div 
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(opt.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="px-4 py-3 flex items-center justify-between hover:bg-yellow-500/10 cursor-pointer text-xs text-gray-300 hover:text-yellow-500 transition-colors"
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-yellow-500" />}
              </div>
            ))}
            {filtered.length === 0 && <div className="p-4 text-center text-gray-600 text-xs italic">No matches found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
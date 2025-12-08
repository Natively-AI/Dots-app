'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search events..." }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="text-gray-400 text-lg">🔍</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-5 py-4 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-400 shadow-lg"
      />
    </div>
  );
}


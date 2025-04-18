import { useState, useEffect, useRef } from 'react';

interface SelectProps {
    options: string[];
    placeholder?: string;
    onChange?: (value: string) => void;
}

export default function Select({ options, placeholder = "Sélectionner une option" }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left w-[180px]" ref={selectRef}>
            <button
                type="button"
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white disabled:cursor-not-allowed disabled:opacity-50 w-full cursor-pointer"
            >
                <span className="truncate">
                    {selectedOption ? selectedOption : placeholder}
                </span>
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 opacity-50"
                    aria-hidden="true"
                >
                    <path
                        d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <ul
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1.5 text-sm focus:outline-none"
                    role="listbox"
                >
                    {options.map((option, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(option)}
                            className={`flex justify-between items-center cursor-pointer select-none relative py-1.5 px-2.5 rounded hover:bg-slate-200 ${selectedOption === option ? 'bg-slate-200' : ''} ${index < options.length - 1 ? 'mb-1' : ''}`}
                            role="option"
                        >
                            {option}
                            {selectedOption === option && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-3 h-3"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
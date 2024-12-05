import { useEffect, useState } from "react";
import { LANGUAGE_VERSIONS } from "../utils/language";

const LanguageSelector = ({ onSelect, selectedLanguage }) => {
    // Use the passed selectedLanguage as the primary source of truth
    const [language, setLanguage] = useState(
        selectedLanguage ||
            localStorage.getItem("selectedLanguage") ||
            "javascript"
    );

    // Use useEffect to update the local state when selectedLanguage changes
    useEffect(() => {
        setLanguage(selectedLanguage || "javascript");
    }, [selectedLanguage]);

    const handleChange = (language) => {
        setLanguage(language);
        localStorage.setItem("selectedLanguage", language);
        onSelect(language);
    };

    return (
        <div className="ml-3">
            <label
                htmlFor="languages"
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                Select Language
            </label>
            <select
                name="languages"
                id="languages"
                value={language}
                onChange={(e) => handleChange(e.target.value)}
                className="px-2 py-2 border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-zinc-500 text-white"
            >
                {Object.entries(LANGUAGE_VERSIONS).map(([lang, version]) => (
                    <option
                        key={lang}
                        value={lang}
                        className="text-gray-700 bg-zinc-500 text-white"
                    >
                        {lang} ({version})
                    </option>
                ))}
            </select>
        </div>
    );
};
export default LanguageSelector;

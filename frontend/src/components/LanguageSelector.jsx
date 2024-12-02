import React, { useState, useEffect } from "react";
import { LANGUAGE_VERSIONS } from "../utils/language";

const LanguageSelector = ({ onSelect }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(
        localStorage.getItem("selectedLanguage") || Object.keys(LANGUAGE_VERSIONS)[0]
    );

    // Update localStorage and trigger the onSelect callback when the language changes
    const handleChange = (language) => {
        setSelectedLanguage(language);
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
                value={selectedLanguage}
                onChange={(e) => handleChange(e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {Object.entries(LANGUAGE_VERSIONS).map(([lang, version]) => (
                    <option key={lang} value={lang} className="text-gray-700">
                        {lang} ({version})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;

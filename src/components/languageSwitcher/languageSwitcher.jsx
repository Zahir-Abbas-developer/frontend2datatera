import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = ({ width, openSideBar }) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang && languages.some((lang) => lang.code === savedLang)) {
      i18n.changeLanguage(savedLang);
      setCurrentLang(savedLang);
    }
  }, [i18n]);

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    localStorage.setItem("i18nextLng", code);
  };

  // Always show the label text regardless of sidebar state
  const shouldShowLabel = true;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              color: "#E2E8F0",
              backgroundColor: "transparent",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.2s ease",
              fontWeight: "500",
              fontSize: "14px",
              position: "relative",
              overflow: "hidden",
            }}
            className="hover:bg-slate-700"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "6px",
                backgroundColor: "rgba(96, 165, 250, 0.2)",
                flexShrink: 0
              }}
            >
              <Globe style={{ width: "14px", height: "14px", color: "#60A5FA" }} />
            </div>
            
            {shouldShowLabel && (
              <span style={{ 
                flex: 1, 
                textAlign: "left",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {languages.find((lang) => lang.code === currentLang)?.label || "English"}
              </span>
            )}
            
            <ChevronDown 
              style={{ 
                width: "16px", 
                height: "16px", 
                opacity: 0.7,
                transition: "transform 0.2s ease",
                flexShrink: 0
              }} 
              className="dropdown-chevron"
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="start" 
          style={{
            width: "200px",
            backgroundColor: "#2D3748",
            border: "1px solid #4A5568",
            borderRadius: "8px",
            padding: "4px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          }}
        >
          {languages.map(({ code, label }) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleChange(code)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                color: currentLang === code ? "#60A5FA" : "#E2E8F0",
                backgroundColor: currentLang === code ? "rgba(96, 165, 250, 0.1)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-slate-700"
            >
              <span>{label}</span>
              {currentLang === code && (
                <Check style={{ width: "16px", height: "16px" }} />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <style jsx>{`
        :global(.dropdown-chevron) {
          transition: transform 0.2s ease;
        }
        
        :global([data-state="open"] .dropdown-chevron) {
          transform: rotate(180deg);
        }
        
        :global(.hover\:bg-slate-700:hover) {
          background-color: rgba(55, 65, 81, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
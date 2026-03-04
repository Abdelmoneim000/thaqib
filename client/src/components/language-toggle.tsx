import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
    const { i18n } = useTranslation();

    const changeLang = (newLang: string) => {
        i18n.changeLanguage(newLang);
        // Update document direction for RTL support
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLang;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    data-testid="language-toggle"
                >
                    <Languages className="h-4 w-4" />
                    {i18n.language === "ar" ? "العربية" : "English"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLang("en")} className="cursor-pointer flex justify-between">
                    English
                    {i18n.language === "en" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLang("ar")} className="cursor-pointer flex justify-between">
                    العربية
                    {i18n.language === "ar" && <Check className="h-4 w-4 ml-2 text-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

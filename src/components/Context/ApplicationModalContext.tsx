import { createContext, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface ApplicationModalContextType {
    onClose: () => void;
}

const ApplicationModalContext = createContext<ApplicationModalContextType | null>(null);

export function ApplicationModalProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();

    //common modal functions here
    const onClose = useCallback(() => {
        navigate("/applications");
    }, [navigate]);


    return (
        <ApplicationModalContext.Provider value={{ onClose }}>
            {children}
        </ApplicationModalContext.Provider>
    );
}

export function useApplicationModalContext() {
    const ctx = useContext(ApplicationModalContext);
    if (!ctx) throw new Error("useApplicationModalContext must be within ApplicationModalProvider");
    return ctx;
}
import { createContext, useContext, useState } from "react"

interface overlayContextType {
    showOverlay: boolean
    setShowOverlay: (value: boolean) => void
}

const OverlayContext = createContext<overlayContextType | undefined>(undefined)


export const OverlayProvider = ({ children }: {children: React.ReactNode}) => {
    const [showOverlay, setShowOverlay] = useState(false)

    return (
        <OverlayContext.Provider value={{ showOverlay , setShowOverlay}}>
             {children}
        </OverlayContext.Provider>
    )
}

export const useOverlay =() => {
    const context = useContext(OverlayContext)
    if(!context) throw new Error('useOverlay must be used')
        return context
}
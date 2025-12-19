import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Location {
    city: string;
    state: string;
    country: string;
    simulated: boolean;
}

interface LocationContextType {
    location: Location;
    setLocation: (location: Location) => void;
    getLocationString: () => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DEFAULT_LOCATION: Location = {
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    simulated: true,
};

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

    const getLocationString = () => {
        return `${location.city}, ${location.state}`;
    };

    return (
        <LocationContext.Provider value={{ location, setLocation, getLocationString }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

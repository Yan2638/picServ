import { createContext, useContext, useState, ReactNode } from 'react';
import { LevelUpNotification } from "../components/LevelUpNotification";

type Reward = {
    gold?: number;
    skillPoints?: number;
};

interface LevelUpContextType {
    triggerLevelUp: (level: number, rewards: Reward) => void;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export const useLevelUp = () => {
    const context = useContext(LevelUpContext);
    if (!context) throw new Error('useLevelUp must be used within LevelUpProvider');
    return context;
};

export const LevelUpProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [level, setLevel] = useState<number | null>(null);
    const [rewards, setRewards] = useState<Reward>({});

    const triggerLevelUp = (newLevel: number, newRewards: Reward) => {
        setLevel(newLevel);
        setRewards(newRewards);
        setVisible(true);
    };

    const handleClose = () => {
        setVisible(false);
        setLevel(null);
        setRewards({});
    };

    return (
        <LevelUpContext.Provider value={{ triggerLevelUp }}>
            {children}
            <LevelUpNotification
                show={visible}
                level={level || 1}
                rewards={rewards}
                onClose={handleClose}
            />
        </LevelUpContext.Provider>
    );
};

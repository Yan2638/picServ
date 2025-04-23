// components/LevelUpNotification.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Coins, PlusCircle } from 'lucide-react';

interface LevelUpNotificationProps {
    show: boolean;
    level: number;
    rewards: {
        gold?: number;
        skillPoints?: number;
    };
    onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
                                                                            show,
                                                                            level,
                                                                            rewards,
                                                                            onClose
                                                                        }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ duration: 0.5 }}
                    className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl shadow-2xl px-6 py-4 w-[360px] border-2 border-white"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="text-yellow-300 w-7 h-7" />
                        <h2 className="text-xl font-bold tracking-wide">
                            Уровень повышен!
                        </h2>
                    </div>

                    <p className="text-lg mb-2">Ты достиг уровня <span className="font-bold text-yellow-300">#{level}</span></p>

                    <div className="space-y-2">
                        {rewards.gold ? (
                            <div className="flex items-center gap-2 text-sm">
                                <Coins className="w-5 h-5 text-amber-400" />
                                <span>+{rewards.gold} золота</span>
                            </div>
                        ) : null}

                        {rewards.skillPoints ? (
                            <div className="flex items-center gap-2 text-sm">
                                <PlusCircle className="w-5 h-5 text-green-300" />
                                <span>+{rewards.skillPoints} очков навыков</span>
                            </div>
                        ) : null}
                    </div>

                    <button
                        className="mt-4 text-sm underline hover:text-yellow-300"
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

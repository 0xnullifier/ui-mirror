import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const VerticalTimeline = ({ items = [] }: {
    items: {
        id: string;
        title: string;
        date: string;
        icon: React.JSX.Element;
    }[]
}) => {
    const [timelineItems, setTimelineItems] = useState(items);

    // Sort items by date (newest first)
    useEffect(() => {
        const sortedItems = [...items].sort((a, b) =>
            (new Date(b.date)).getSeconds() - (new Date(a.date)).getSeconds()
        );
        setTimelineItems(sortedItems);
    }, [items]);

    return (
        <div className="w-[400px] max-w-md mx-auto bg-white rounded-lg p-10 h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Relevant Verification</h2>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

                <AnimatePresence>
                    {timelineItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative flex items-start mb-8 last:mb-0"
                        >
                            <div className="z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-md"
                                >
                                    {item.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="ml-4 flex-grow">
                                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                <p className="text-sm text-gray-400 font-bold">{item.date}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VerticalTimeline;

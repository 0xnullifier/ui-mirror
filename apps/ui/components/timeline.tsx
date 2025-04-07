import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, MoveUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import axios from 'axios';
import { CUSTODIAN_GET_PROOF } from '@/lib/endpoint';
const VerticalTimeline = ({ items = [] }: {
    items: {
        id: string;
        title: string;
        date: string;
        icon: React.JSX.Element;
        backendUrl: string;
        txUrl?: string;
    }[]
}) => {
    const [timelineItems, setTimelineItems] = useState(items);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<typeof items[0] | null>(null);

    // Sort items by date (newest first)
    useEffect(() => {
        const sortedItems = [...items].sort((a, b) =>
            (new Date(b.date)).getSeconds() - (new Date(a.date)).getSeconds()
        );
        setTimelineItems(sortedItems);
    }, [items]);

    const handleDownloadClick = (item: typeof items[0]) => {
        setCurrentItem(item);
        setIsDialogOpen(true);
    };

    const downloadProof = async (url: string) => {
        const proofJson = await axios.get(CUSTODIAN_GET_PROOF(url));
        try {
            const proofData = proofJson.data;
            const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'proof.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading proof:', error);
        }
    }

    const downloadAndVerify = (url: string) => {
        //TODO: compile contracts and verify
    }


    return (
        <div className="w-[400px] max-w-md mx-auto bg-white rounded-lg p-10 h-max-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Custodians Activities</h2>

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
                            <div className="ml-4 flex-grow w-full">
                                <h3
                                    className="text font-semibold text-gray-800 break-words whitespace-normal"
                                >
                                    {item.title}
                                </h3>
                                <div className="text-sm text-gray-400 font-bold flex gap-2">
                                    {item.date}
                                    <button onClick={() => handleDownloadClick(item)} className="flex items-center">
                                        <Download className='w-4 h-4' />
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Download Options</DialogTitle>
                                                    <DialogDescription>
                                                        Choose how you want to download the proof
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex flex-col gap-4 py-4">
                                                    <Button
                                                        onClick={() => {
                                                            downloadProof(item.backendUrl);
                                                            setIsDialogOpen(false);
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Download Proof
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            downloadAndVerify(item.backendUrl);
                                                            setIsDialogOpen(false);
                                                            // Additional logic for verification could go here
                                                        }}
                                                        variant="ghost"
                                                        className="w-full"
                                                    >
                                                        Download and Verify Onchain
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </button>
                                    {item.txUrl &&
                                        <a className="flex items-center cursor-pointer" target='_blank' href={item.txUrl}>
                                            <MoveUpRight className='w-4 h-4' />
                                        </a>
                                    }
                                </div>

                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>


        </div>
    );
};

export default VerticalTimeline;

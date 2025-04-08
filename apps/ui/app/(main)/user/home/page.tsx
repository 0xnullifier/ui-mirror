"use client"

import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/table"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, AlertCircle, Calendar } from 'lucide-react';
import { CompanyRowItem } from "@/components/CompanyRowItem";
import { Chart } from "@/components/Chart";
import { Status, StatusText } from "@/components/StatusText";

export default function UserHome() {
    const dummyData: TableData[] = [
        {
            company: <CompanyRowItem name="Binance" icon="/assets/binance.svg" />,
            numProofs: 14_000,
            status: "Verifying onChain",
            lastVerificationTx: "0xabcd....9876",
            lastProofGeneratedLink: "#"
        },
        {
            company: <CompanyRowItem name="Dummy Cex" icon="/assets/mexc.svg" />,
            numProofs: 5_000,
            status: "Failed",
            lastVerificationTx: "0xabcd....9876",
            lastProofGeneratedLink: "#"
        },
        {
            company: <CompanyRowItem name="Gate.io" icon="/assets/gate-io.svg" />,
            numProofs: 20_000,
            status: "Proof Verified",
            lastVerificationTx: "0xabcd....9876",
            lastProofGeneratedLink: "#"
        },
    ];

    return (
        <div className="w-full flex flex-col justify-center mr-20">
            <div className="flex flex-col bg-white p-[2rem] rounded-3xl mt-20">
                <p className="text-2xl mb-12 font-bold">Summary</p>
                <ExchangeSummaryTable data={dummyData} />
            </div>
            <div className="flex mt-10">
                <Chart chartData={[]} />
                <OnChainTransactions transactions={dummyTransactions} rangeDate="1 - 30 March 2025" />
            </div>
        </div>
    )
}



interface TableData {
    // with icon the and the style
    company: React.ReactNode,
    numProofs: number,
    status: Status,
    lastVerificationTx: string
    lastProofGeneratedLink: string
}


const ExchangeSummaryTable = ({ data }: { data: TableData[] }) => {
    return (
        <TableRoot>
            <Table >
                <TableHead>
                    <TableRow >
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold flex text-sm">CUSTODIAN <p className="invisible">asdkljal;sdfkja;sldfjl;ajdfasdl;ksdjkl;asjdfl;asjdl;f</p></TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold px-10 text-center">PROOFS VERIFIED </TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold px-10 text-center">STATUS</TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold px-10 text-center">LAST VERIFICATION TX</TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold text-center">LAST PROOF GENERATED</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody >
                    {data.map((item, index) => (
                        <TableRow key={index} className="w-full font-extrabold">
                            <TableCell >{item.company}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.numProofs}</TableCell>
                            <TableCell className="text-center text-[1rem]"><StatusText status={item.status} /></TableCell>
                            <TableCell className="text-center text-[1rem]">{item.lastVerificationTx}</TableCell>
                            <TableCell className="flex justify-center">
                                <a href={item.lastProofGeneratedLink} target="_blank" rel="noopener noreferrer" className="text-[#8E64CD] font-bold">View</a>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableRoot>
    )
}


interface TransactionProps {
    id: string;
    hash: string;
    timestamp: string;
    status: "Success" | "Failed" | "Pending";
}

// Dummy data
const dummyTransactions: TransactionProps[] = [
    {
        id: '1',
        hash: '0x123...234',
        timestamp: '2020-03-27T12:30:00',
        status: 'Failed'
    },
    {
        id: '2',
        hash: '0xabc...egd',
        timestamp: '2020-03-27T12:30:00',
        status: 'Success'
    },
    {
        id: '3',
        hash: '0x123a..5f',
        timestamp: '2020-03-26T13:45:00',
        status: 'Success'
    },
    {
        id: '4',
        hash: '0xjh123...asd',
        timestamp: '2020-03-26T12:30:00',
        status: 'Success'
    },
    {
        id: '5',
        hash: '0x123...asd',
        timestamp: '2020-03-26T05:00:00',
        status: 'Pending'
    }
];

const OnChainTransactions = ({ transactions = dummyTransactions, rangeDate }: { transactions: TransactionProps[], rangeDate: string }) => {
    const [displayTransactions, setDisplayTransactions] = useState(transactions);

    // Simulate new transactions coming in
    useEffect(() => {
        const interval = setInterval(() => {
            const randomStatus: "Success" | "Failed" | "Pending" = Math.random() > 0.7 ? 'Failed' : Math.random() > 0.4 ? 'Success' : 'Pending';
            const newTx: TransactionProps = {
                id: `new-${Date.now()}`,
                hash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 5)}`,
                timestamp: new Date().toISOString(),
                status: randomStatus
            };

            setDisplayTransactions(prev => [newTx, ...prev.slice(0, 9)]); // Keep only 10 transactions
        }, 5000); // New transaction every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Group transactions by day
    const groupedTransactions = displayTransactions.reduce((groups: { [key: string]: typeof displayTransactions }, transaction) => {
        const date = new Date(transaction.timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let groupName;
        if (date.toDateString() === today.toDateString()) {
            groupName = "NEWEST";
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupName = "YESTERDAY";
        } else {
            groupName = date.toDateString();
        }

        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(transaction);
        return groups;
    }, {});

    // When external transactions come in
    useEffect(() => {
        setDisplayTransactions(prev => {
            // Check for new transactions
            const newTransactions = transactions.filter(
                tx => !prev.some(prevTx => prevTx.id === tx.id)
            );

            // Add new transactions at the beginning of the array
            return [...newTransactions, ...prev];
        });
    }, [transactions]);

    // Status icon component
    const StatusIcon = ({ status }: { status: "Failed" | "Success" | "Pending" }) => {
        switch (status) {
            case 'Success':
                return <ArrowUp className="w-5 h-5 text-green-500" />;
            case 'Failed':
                return <ArrowDown className="w-5 h-5 text-red-500" />;
            case 'Pending':
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    // Format date function
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}, at ${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <div className="bg-white rounded-3xl p-6 max-w-2xl mx-auto h-[600px] overflow-y-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">OnChain Transactions</h1>
                <div className="flex items-center text-gray-500">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{rangeDate}</span>
                </div>
            </div>

            {Object.entries(groupedTransactions).map(([group, txs]) => (
                <div key={group} className="mb-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-3">{group}</h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {txs.map(tx => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 mr-4"
                                        >
                                            <StatusIcon status={tx.status} />
                                        </motion.div>
                                        <div>
                                            <p className="font-mono text-gray-800 font-medium">{tx.hash}</p>
                                            <p className="text-gray-500 text-sm">{formatDate(tx.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className={`font-medium ${tx.status === 'Success' ? 'text-green-500' :
                                        tx.status === 'Failed' ? 'text-red-500' : 'text-gray-500'
                                        }`}>
                                        {tx.status}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
};

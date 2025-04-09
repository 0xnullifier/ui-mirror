"use client"
import React, { use, useCallback, useEffect, useState } from "react";

import { TokenText } from "@/components/token-name";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRoot,
    TableRow,
} from "@/components/table"
import { table } from "console";
import Image from "next/image";
import VerticalTimeline from "@/components/timeline";
import { Card } from "@/components/card";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Plus, Upload, X } from "lucide-react";
import { Button } from '@/components/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/dialog";
import { Input } from "@/components/input";
import useStore, { Custodian } from "@/lib/store";
import axios from "axios";
import { CUSTODIAN_INCLUSION_PROOFS } from "@/lib/endpoint";
import { Bool, fetchAccount, Field, Group, Mina, PublicKey, UInt32 } from "o1js"
import { NetZeroLiabilitiesVerifier } from "@netzero/contracts"
import { InclusionProofProgram, rangeCheckProgram, MerkleWitness, NodeContent, UserParams } from "@netzero/circuits"
import { Tooltip } from "@/components/Tooltip";
import { TableData } from "@/lib/types";
import { handleGenerateAndVerify } from "@/lib/actions";
import { useToast } from "@/lib/hooks/useToast";

const PRECISION = 1e5
interface AssetEntry {
    exchange: string;
    asset: string;
    collateral: string;
    debt: string;
}

interface publicParams {
    saltS: [];
    saltB: string[];
}

export default function Page(
) {
    const [tableData, setTableData] = useState<TableData[]>([]);
    const searchParams = useSearchParams()
    const userName = searchParams.get("user")
    const [entries, setEntries] = useState<AssetEntry[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const { custodians } = useStore()
    const [assets, setAssets] = useState<string[]>([]);
    const [selectedExchanges, setSelectedExchanges] = useState<Custodian[]>([]);
    const [csvData, setCsvData] = useState<string>("");
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);

    const { toast } = useToast()

    const addEntry = () => {
        setEntries([...entries, { exchange: '', asset: '', collateral: '', debt: '' }]);
    };

    useEffect(() => {
        if (selectedIndex == null) {
            setAssets([])
            return
        }
        setAssets(custodians[selectedIndex].assets)
    }, [selectedIndex])

    const removeEntry = (index: number) => {
        const newEntries = [...entries];
        newEntries.splice(index, 1);
        setEntries(newEntries);
    };

    const updateEntry = (index: number, field: keyof AssetEntry, value: string) => {
        setEntries((prevEntries) => {
            const updatedEntries = [...prevEntries];
            updatedEntries[index][field] = value;

            if (field === 'exchange') {
                const custodianIndex = custodians.findIndex(c => c.name === value);
                setSelectedIndex(custodianIndex !== -1 ? custodianIndex : null);

                if (custodianIndex !== -1) {
                    const selected = custodians[custodianIndex];
                    setAssets(selected.assets);

                    if (!selectedExchanges.some(ex => ex.name === selected.name)) {
                        setSelectedExchanges((prevExchanges) => [...prevExchanges, selected]);
                    }
                } else {
                    setAssets([]);
                }
            }

            return updatedEntries;
        });
    };

    const handleSave = () => {
        const newTableData = entries.map((entry, index) => ({
            company: <CompanyRowItem name={entry.exchange} icon={custodians[selectedIndex || 0].logo} token={entry.asset} />,
            collateral: entry.collateral,
            debt: entry.debt,
            equity: (Number(entry.collateral) - Number(entry.debt)).toString(),
        }));
        setTableData((prev) => [...prev, ...newTableData]);
        console.log(tableData)
        // set the tabledata in local storage
        localStorage.setItem("tableData", JSON.stringify([...tableData, ...newTableData]));
    }

    useEffect(() => {
        (async () => {
            Mina.setActiveInstance(Mina.Network({ mina: 'https://api.minascan.io/node/devnet/v1/graphql', networkId: 'testnet' }));
        })()
    }, [])

    const canUploadCsvData = (entry: AssetEntry) => {
        if (entry.exchange === "") {
            toast({
                title: "Please select exchange",
                description: "You need to select exchange before uploading",
                variant: "error"
            })
            setCsvDialogOpen(false);
            return
        }
        setCsvDialogOpen(true);
    }

    const handleCsvData = (entry: AssetEntry) => {
        if (csvData) {
            const rows = csvData.split("\n").map(row => row.split(/\s+|,/));
            console.log(rows)
            const parsedEntries = rows.map(([asset, value, debt]) => {
                const isValidAsset = custodians.some(custodian =>
                    custodian.name === entry.exchange && custodian.assets.includes(asset.trim())
                );

                if (!isValidAsset) {
                    toast({
                        title: "Invalid Asset",
                        description: `The asset "${asset.trim()}" is not valid for the selected exchange.`,
                        variant: "error"
                    });
                    return undefined
                }
                return {
                    exchange: entry.exchange,
                    asset: asset.trim(),
                    collateral: value.trim(),
                    debt: debt.trim(), // Default debt to 0
                }
            }
            );
            // pop the last entry from where this was set and then 
            setEntries(prevEntries => {
                const validEntries = parsedEntries.filter((entry): entry is AssetEntry => entry !== undefined);
                const newEntries = [...prevEntries];
                newEntries.pop();
                return [...newEntries, ...validEntries];
            });
            setCsvDialogOpen(false)
        } else {
            toast({
                title: "Please enter csv data",
                description: "You need to enter csv data before uploading",
                variant: "error"
            })
        }
    }
    return (
        <div>
            {userName != null ? (
                <>
                    <div className="w-full mt-20">
                        <Hi userName={userName} />
                    </div>
                    <div className="w-full flex justify-center mt-10 gap-10 items-start">
                        <div className="flex flex-col bg-white p-[2rem] rounded-3xl">
                            <div className="flex justify-between items-center mb-12">
                                <p className="text-2xl font-bold text-center align-middle">Tokens</p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary"><Plus className="w-6 h-6" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>Manage Exchange Entries</DialogTitle>
                                        </DialogHeader>

                                        <div className="mt-4 overflow-auto max-h-96">
                                            <div className="flex flex-col gap-4">
                                                <div className="grid grid-cols-12 gap-3 font-medium text-sm">
                                                    <div className="col-span-3">Exchange</div>
                                                    <div className="col-span-3">Asset</div>
                                                    <div className="col-span-2">Collateral</div>
                                                    <div className="col-span-2">Debt</div>
                                                    <div className="col-span-2"></div>
                                                </div>

                                                {entries.map((entry, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                                        <div className="col-span-3">
                                                            <div className="relative">
                                                                <select
                                                                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm border-none !outline-none  appearance-none decoration-transparent"
                                                                    value={entry.exchange}
                                                                    onChange={(e) => updateEntry(index, 'exchange', e.target.value)}
                                                                >
                                                                    <option value="">Select Exchange</option>
                                                                    {custodians.map((ex, index) => (
                                                                        <option key={ex.name} value={ex.name}>{ex.name}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-3">
                                                            <div className="relative">
                                                                <select
                                                                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:outline-none appearance-none"
                                                                    value={entry.asset}
                                                                    onChange={(e) => updateEntry(index, 'asset', e.target.value)}
                                                                >
                                                                    <option value="">Select Asset</option>
                                                                    {assets.map((asset) => (
                                                                        <option key={asset} value={asset}>{asset}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-2">
                                                            <Input
                                                                type="text"
                                                                placeholder="Collateral"
                                                                value={entry.collateral}
                                                                onChange={(e) => updateEntry(index, 'collateral', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="col-span-2">
                                                            <Input
                                                                type="text"
                                                                placeholder="Debt"
                                                                value={entry.debt}
                                                                onChange={(e) => updateEntry(index, 'debt', e.target.value)}
                                                            />
                                                        </div>
                                                        {entry.asset !== "" ?
                                                            (
                                                                <div className="col-span-2 flex justify-end">
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={() => removeEntry(index)}
                                                                    >
                                                                        <X className="h-4 w-4 text-gray-500" />
                                                                    </Button>
                                                                </div>

                                                            )
                                                            : (
                                                                <div className="col-span-2 flex justify-end relative">
                                                                    <Dialog open={csvDialogOpen} >
                                                                        <DialogTrigger asChild>
                                                                            <Tooltip content="Upload data as csv" className="z-[1050]" asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    className="h-8 w-8 p-0"
                                                                                    onClick={() => canUploadCsvData(entry)}
                                                                                >
                                                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                                                </Button>
                                                                            </Tooltip>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="sm:max-w-3xl">
                                                                            <DialogHeader>
                                                                                <DialogTitle>Upload CSV Data</DialogTitle>
                                                                            </DialogHeader>
                                                                            <div className="mt-4">
                                                                                <textarea
                                                                                    className="w-full h-40 p-2 border border-gray-300 rounded-md"
                                                                                    placeholder="Enter CSV data as AssetName, Value"
                                                                                    value={csvData}
                                                                                    onChange={(e) => setCsvData(e.target.value)}
                                                                                ></textarea>
                                                                            </div>
                                                                            <DialogFooter className="mt-6">
                                                                                <DialogClose asChild>
                                                                                    <Button
                                                                                        variant="secondary"
                                                                                        className="mr-2"
                                                                                        onClick={() => setCsvDialogOpen(false)}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                </DialogClose>
                                                                                <Button
                                                                                    onClick={() => handleCsvData(entry)}
                                                                                >
                                                                                    Set
                                                                                </Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </div>

                                                            )
                                                        }

                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Button
                                                variant="ghost"
                                                className="w-full"
                                                onClick={addEntry}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Add Entry
                                            </Button>
                                        </div>

                                        <DialogFooter className="mt-6">
                                            <DialogClose asChild>
                                                <Button
                                                    variant="secondary"
                                                    className="mr-2"
                                                >
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button onClick={handleSave}>Save Changes</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                            </div>
                            <TokenTable data={tableData} />
                            <div className="mt-4">
                                {selectedExchanges.map((exchange, index) => (
                                    <Button
                                        key={index}
                                        variant="primary"
                                        className="mb-2"
                                        onClick={() => handleGenerateAndVerify(exchange, tableData)}
                                    >
                                        Gen&Verify {exchange.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <TimelineDemo />
                        </div>
                    </div>
                </>
            ) : <div> Could not find you please login again </div>}
        </div>
    )
}




const TokenTable = ({ data }: { data: TableData[] }) => {
    return (
        <TableRoot>
            <Table className="">
                <TableHead>
                    <TableRow className="text-sm">
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold flex text-sm">CUSTODIAN <p className="invisible">asdkljal;sdfkja;sldfjl;ajdfasdl;ksdjkl;asjdfl;asjdl;f</p></TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold px-10">COLLATERAL </TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold px-10">DEBT</TableHeaderCell>
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold px-10">EQUITY</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody >
                    {data.map((item, index) => (
                        <TableRow key={index} className="w-full font-extrabold">
                            <TableCell >{item.company}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.collateral}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.debt}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.equity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableRoot>
    )
}


export const CompanyRowItem = ({ name, icon, token }: { name: string, icon: string, token?: string }) => {
    return (
        <div className="flex justify-start items-center text-[1.15rem]">
            <Image src={icon} alt="Dummy Cex" width={20} height={20} />
            <span className="mx-2">{name}  {token && <TokenText text={token} />}</span>
        </div>
    )
}


const TimelineDemo = () => {
    const [timelineData, setTimelineData] = useState([
        {
            id: '6',
            title: 'Mexc Verification',
            date: '18 DEC 4:41 PM',
            icon: <Image src="/assets/mexc.svg" alt="Mexc" width={20} height={20} />,
        },
        {
            id: '5',
            title: 'Gate.io Verification',
            date: '19 DEC 11:35 PM',
            icon: <Image src="/assets/gate-io.svg" alt="Gate.io" width={20} height={20} />,
        },
        {
            id: '4',
            title: 'Binance Verification',
            date: '20 DEC 3:52 PM',
            icon: <Image src="/assets/binance.svg" alt="Binance" width={20} height={20} />,
        }
    ]);

    // Function to add a new item to the timeline
    const addNewItem = () => {
        const newItems = [
            {
                id: '3',
                title: 'Gate.io Verification',
                date: '21 DEC 9:28 PM',
                icon: <Image src="/assets/gate-io.svg" alt="Gate.io" width={20} height={20} />,
            },
            {
                id: '2',
                title: 'Dummy Cex Verification',
                date: '21 DEC 11:21 PM',
                icon: <Image src="/assets/mexc.svg" alt="Dummy Cex" width={20} height={20} />,
            },
            {
                id: '1',
                title: 'Binance Verification',
                date: '22 DEC 7:20 PM',
                icon: <Image src="/assets/binance.svg" alt="Binance" width={20} height={20} />,
            }
        ];

        // Add one item at a time with delay
        let timer = 0;
        newItems.forEach(item => {
            setTimeout(() => {
                setTimelineData(prev => [item, ...prev]);
            }, timer);
            timer += 1000;
        });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <VerticalTimeline items={timelineData} />
        </div>
    );
};

export const Stats = () => {
    const [statsData, setStateData] = useState([
        {
            title: "Total Collateral",
            value: "$1,000,000",
            percetageChange: 5,
            icon: <Image src="/assets/wallet-icon.svg" alt="Mexc" width={50} height={50} />,
        },
        {
            title: "Total Equity",
            value: "$1,000,000",
            percetageChange: -5,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF8A62" className="w-[45px] h-[45px]">
                <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
            </svg>

        },
        {
            title: "Total Debt",
            value: "$1,000,000",
            percetageChange: +5,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF8A62" className="w-[45px] h-[45px]">
                <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
            </svg>



        },
    ]);

    return (
        <div>
            <ul className="flex gap-10">
                {statsData.map((item, index) => (
                    <Stat key={index} title={item.title} value={item.value} percetageChange={item.percetageChange} icon={item.icon} />
                ))}
            </ul>
        </div>
    )
}

export const Stat = ({
    title,
    value,
    percetageChange,
    icon
}: {
    title: string
    value: string
    percetageChange: number
    icon: React.ReactNode
}) => {
    return (
        <Card asChild className="rounded-3xl">
            <li className="flex gap-2">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <p className="text-[0.85rem] text-[#A0AEC0] font-bold">{title}</p>
                        <p className="text-2xl font-bold">{value}<span className={percetageChange > 0 ? "text-green-500 pl-2 text-[0.95rem]" : "text-red-500 pl-2 text-[0.95rem]"}>{percetageChange > 0 ? "+" : "-"}{Math.abs(percetageChange)} %</span></p>
                    </div>
                    <div>
                        {icon}
                    </div>
                </div>
            </li>
        </Card>
    )
}


export const Hi = ({ userName }: { userName: string }) => {
    return (
        <div className="flex justify-between items-center mb-10 ml-2">
            <p className="text-4xl font-bold">Hi, {userName} <span className="px-1"></span> 👋</p>
        </div>
    )
}


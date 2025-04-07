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
import { hash } from "@/lib/actions";
import { useToast } from "@/lib/hooks/useToast";
import { CompanyRowItem } from "@/components/CompanyRowItem";
import { Hi } from "@/components/Hi";

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
    const [entries, setEntries] = useState<AssetEntry[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const { custodians } = useStore()
    const [assets, setAssets] = useState<string[]>([]);
    const [selectedExchanges, setSelectedExchanges] = useState<Custodian[]>([]);
    const [csvData, setCsvData] = useState<string>("");
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);
    const user = {
        email: "david.jones20@gmail.com"
    }
    console.log(user)
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
            const rows = csvData?.split("\n").map(row => row?.split(/\s+|,/));
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

    const handleGenerateAndVerify = async (exchange: Custodian, tableData: TableData[]) => {
        if (!user) {
            return;
        }
        try {
            const userId = BigInt('0x' + await hash(user.email)).toString();
            const result = await axios.post(CUSTODIAN_INCLUSION_PROOFS(exchange.backendurl), {
                userId
            });

            const { account, error } = await fetchAccount({ publicKey: PublicKey.fromBase58(exchange.liabilitiesZkAppAddress) });
            if (error) {
                console.error("Error fetching account:", error);
                toast({
                    title: "Error",
                    description: "Error fetching account: " + error.statusText,
                    variant: "error",
                });
                return;
            }

            const zkApp = new NetZeroLiabilitiesVerifier(PublicKey.fromBase58(exchange.liabilitiesZkAppAddress));

            console.time("range check program");
            await rangeCheckProgram.compile();
            console.timeEnd("range check program");
            console.time("Inclusion proof program compile");
            await InclusionProofProgram.compile();
            console.timeEnd("Inclusion proof program compile");
            console.time("contract compile");
            await NetZeroLiabilitiesVerifier.compile();
            console.timeEnd("contract compile");

            let path: NodeContent[] = result.data.proof.path.map((p: { commitment: { x: string, y: string }, hash: string }) => {
                return new NodeContent({ commitment: Group.fromJSON(p.commitment), hash: Field.fromJSON(p.hash) });
            });
            for (let i = path.length; i < 32; i++) {
                path.push(new NodeContent({ commitment: Group.zero, hash: Field(0) }));
            }
            let lefts = result.data.proof.lefts.map((l: boolean) => Bool.fromValue(l));
            for (let i = lefts.length; i < 32; i++) {
                lefts.push(Bool.fromValue(false));
            }

            const merkleWitness = new MerkleWitness({
                path,
                lefts
            });

            const blindingFactor = Field(result.data.blindingFactor);
            const userSecret = Field(result.data.userSecret);

            const relevantEntries = tableData
                ///@ts-ignore
                .filter(entry => entry.company.props.name === exchange.name);
            console.log(relevantEntries);
            const balances = relevantEntries
                .map(entry => Field(BigInt(Math.floor(Number(entry.equity)))));
            for (let i = balances.length; i < 100; i++) {
                balances.push(Field(0));
            }

            const userParams = new UserParams({
                balances,
                blindingFactor,
                userSecret,
                userId: Field(userId),
            });

            console.log(userParams);

            console.time("generating proof new");
            // generate proof
            const { proof } = await InclusionProofProgram.inclusionProof(merkleWitness, userParams);
            console.timeEnd("generating proof new");

            try {
                // Retrieve Mina provider injected by browser extension wallet
                const mina = (window as any).mina;
                const walletKey: string = (await mina.requestAccounts())[0];
                console.log("Connected wallet address: " + walletKey);
                await fetchAccount({ publicKey: PublicKey.fromBase58(walletKey) });

                const transaction = await Mina.transaction(async () => {
                    console.log("Executing zkApp.verifyInclusion() locally");
                    await zkApp.verifyInclusion(proof);
                });

                // Prove execution of the contract using the proving key
                await transaction.prove();

                // Broadcast the transaction to the Mina network
                console.log("Broadcasting proof of execution to the Mina network");
                const { hash } = await mina.sendTransaction({ transaction: transaction.toJSON() });

                // Display the link to the transaction
                const transactionLink = "https://minascan.io/devnet/tx/" + hash;
                toast({
                    title: "Success",
                    description: `Transaction broadcasted successfully. View it here: ${transactionLink}`,
                    variant: "success",
                });
            } catch (e: any) {
                console.error(e.message);
                let errorMessage = "";

                if (e.message.includes("Cannot read properties of undefined (reading 'requestAccounts')")) {
                    errorMessage = "Is Auro installed?";
                } else if (e.message.includes("Please create or restore wallet first.")) {
                    errorMessage = "Have you created a wallet?";
                } else if (e.message.includes("User rejected the request.")) {
                    errorMessage = "Did you grant the app permission to connect?";
                } else {
                    errorMessage = "An unknown error occurred.";
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "error",
                });
            }
        } catch (error: any) {
            console.error(error.message);
            toast({
                title: "Error",
                description: "An error occurred: " + error.message,
                variant: "error",
            });
        }
    }
    return (
        <div>
            {user != null ? (
                <>
                    <div className="w-full mt-20">
                        <Hi userName={user.email} />
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
                    <DisputeButton />
                </>
            ) : <div> Could not find you please login again </div>}
        </div>
    )
}

const DisputeButton = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [txUrl, setTxUrl] = useState('');
    const [description, setDescription] = useState('');
    const [assetValues, setAssetValues] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!txUrl || !description || !assetValues) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields",
                variant: "error"
            });
            return;
        }

        // Submit the dispute (in a real implementation, this would call an API)
        toast({
            title: "Dispute submitted",
            description: "Your dispute has been submitted successfully",
            variant: "success"
        });
        setIsDialogOpen(false);

        // Reset form
        setTxUrl('');
        setDescription('');
        setAssetValues('');
    };

    return (
        <>
            <Button
                className="fixed right-6 bottom-20 z-50 rounded-full shadow-xl"
                variant="destructive"
                onClick={() => setIsDialogOpen(true)}
            >
                Dispute
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Submit a Dispute</DialogTitle>
                        <DialogDescription>
                            Please provide details about your dispute
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="txUrl" className="text-sm font-medium">Transaction URL</label>
                            <Input
                                id="txUrl"
                                value={txUrl}
                                onChange={(e) => setTxUrl(e.target.value)}
                                placeholder="https://minascan.io/devnet/tx/..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="assetValues" className="text-sm font-medium">Asset Values</label>
                            <Input
                                id="assetValues"
                                value={assetValues}
                                onChange={(e) => setAssetValues(e.target.value)}
                                placeholder="BTC: 0.5, ETH: 10, etc."
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">Description</label>
                            <textarea
                                id="description"
                                className="min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the reason for your dispute..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            Submit Dispute
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};



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



const TimelineDemo = () => {
    const { custodians } = useStore()
    const [timelineData, setTimelineData] = useState<{
        id: string;
        title: string;
        date: string;
        icon: React.JSX.Element;
        backendUrl: string;
        txUrl?: string;
    }[]>([]);
    useEffect(() => {
        // Transform custodians data into the format required by VerticalTimeline
        const transformedData = custodians.map((custodian) => ({
            id: custodian.name, // Unique identifier
            title: `${custodian.name}`,
            date: new Date().toLocaleDateString(), // TODO: see what to do here
            icon: <img src={custodian.logo} alt={`${custodian.name} logo`} className="w-8 h-8" />,
            backendUrl: custodian.backendurl,
            txUrl: custodian.txs?.[0]?.hash ? `https://minascan.io/devnet/tx/${custodian.txs[0].hash}` : undefined,
        }));

        setTimelineData(transformedData);
    }, [custodians]);
    console.log(custodians)

    return (
        <div className="w-full max-w-md mx-auto">
            <VerticalTimeline items={timelineData} />
        </div>
    );
};



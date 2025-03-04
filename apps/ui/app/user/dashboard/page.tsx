"use client"
import React, { useState } from "react";

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



export default function Page(
) {
    const tableData: TableData[] = [
        {
            company: <CompanyRowItem name="Dummy Cex" icon="/assets/mexc.svg" token="MINA" />,
            collateral: "$2,000",
            equity: "$14,000",
            debt: "$12,000",
            includedInPOS: true,
        },
        {
            company: <CompanyRowItem name="Dummy Cex" icon="/assets/mexc.svg" token="ETH" />,
            collateral: "$3,000",
            equity: "$3,000",
            debt: "$0",
            includedInPOS: true,
        },
        {
            company: <CompanyRowItem name="Dummy Cex" icon="/assets/mexc.svg" token="PNUT" />,
            collateral: "--",
            equity: "$500",
            debt: "$500",
            includedInPOS: true,
        },
        {
            company: <CompanyRowItem name="Binance" icon="/assets/binance.svg" token="BTC" />,
            collateral: "$32,000",
            equity: "$32,000",
            debt: "$0",
            includedInPOS: true,
        },
        {
            company: <CompanyRowItem name="Binance" icon="/assets/binance.svg" token="MINA" />,
            collateral: "--",
            equity: "$400",
            debt: "$400",
            includedInPOS: true,
        },
        {
            company: <CompanyRowItem name="Gate.io" icon="/assets/gate-io.svg" token="PEPE" />,
            collateral: "$600",
            equity: "$7,600",
            debt: "$7,000",
            includedInPOS: false,
        },
    ];
    const searchParams = useSearchParams()
    const userName = searchParams.get("user")
    return (
        <div>
            {userName != null ? (
                <>
                    <div className="w-full mt-20">
                        <Hi userName={userName} />
                        <Stats />
                    </div>
                    <div className="w-full flex justify-center mt-10 gap-10 items-start">
                        <div className="flex flex-col bg-white p-[2rem] rounded-3xl">
                            <p className="text-2xl mb-12 font-bold">Tokens</p>
                            <TokenTable data={tableData} />
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

interface TableData {
    // with icon the and the style
    company: React.ReactNode,
    collateral: string
    equity: string
    debt: string
    includedInPOS: boolean
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
                        <TableHeaderCell className="text-[#A0AEC0] font-semi-bold ">INCLUDED IN POS</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody >
                    {data.map((item, index) => (
                        <TableRow key={index} className="w-full font-extrabold">
                            <TableCell >{item.company}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.collateral}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.debt}</TableCell>
                            <TableCell className="text-center text-[1rem]">{item.equity}</TableCell>
                            <TableCell className="flex justify-center">{item.includedInPOS ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#68D391" className="size-6">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                </svg>
                            )
                                : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF070B" className="size-6">
                                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </TableCell>
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

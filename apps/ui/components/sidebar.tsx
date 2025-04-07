"use client";
import React, { useEffect, useState } from 'react';
import { UserIcon, HomeIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { Card } from './card';
import { Button } from './button';
import Image from 'next/image';
import Link from 'next/link';
const Sidebar = () => {
    // taking profile as default active
    const [active, setActive] = useState<"profile" | "home">("profile");
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes("home")) {
            setActive("home");
        } else if (path.includes("dashboard")) {
            setActive("profile");
        }
    }, [])
    const toggleActive = (value: "profile" | "home") => {
        setActive(value);
    }
    return (
        <div className='p-10'>
            <div>
                <Link href='/user/home' className='flex justify-start items-center gap-3'>
                    <Image
                        src="/assets/group.svg"
                        width={40}
                        height={40}
                        alt='logo'
                    />
                    <p className='text-[1.75rem] font-bold pl-10'>NetZero</p>
                </Link>
            </div>
            <div className='flex flex-col mt-7'>
                <div
                    className="h-16 w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent"
                    style={{ height: '1px' }}
                ></div>
                <div className='flex flex-col gap-4 mt-6'>
                    <Link href={"/user/dashboard"} onClick={() => setActive("profile")}><SideBarItem icon={<Image src="/assets/Active-Profile.svg" alt="Profile active icon" width={42} height={43} />} text={"Profile"} active={active === "profile"} /></Link>
                    <Link href={"/user/home"} onClick={() => setActive("home")}><SideBarItem icon={<Image alt="home svg" src="/assets/home-unactive.svg" width={42} height={42} />} text={"Home"} active={active === "home"} /></Link>
                </div>
                <div className='h-[200px]'></div>
                <HelpBanner />
            </div>
        </div >
    );
};

export const SideBarItem = ({ icon, text, active }: { icon: React.ReactNode, text: string, active: boolean }) => {
    return (
        <>
            {active ? (
                <button className='flex justify-start items-center bg-white w-full  rounded-xl py-2 p-2'>
                    {icon}
                    <p className='text-[1rem] font-bold px-[11px]'>{text}</p>
                </button>
            ) : (
                <button className='flex justify-start items-center w-full py-2 p-2'>
                    {icon}
                    <p className='text-[1rem] font-bold text-gray-500 px-[11px]'>{text}</p>
                </button>
            )}
        </>
    );
}

const HelpBanner = () => {

    return (
        <div className="relative w-full max-w-md rounded-xl bg-gradient-to-b from-[#D36A46] from-14% via-[#D36A46] via-40% to-[#8E64CD] to-100% px-6 py-4 text-white shadow-lg overflow-hidden">


            {/* Question mark icon */}
            <div className='my-2 mb-6'>
                <Image src={"/assets/question-mark.svg"} alt="question mark" width={40} height={40} />
            </div>
            {/* Text content */}
            <div className="relative z-10 mb-6">
                <h2 className="text-xl font-bold">Need help?</h2>
                <p className="text-sm">Please check our docs</p>
            </div>

            {/* Documentation button */}
            <a href='https://dagoat.gitbook.io/netzero-docs/' target='_blank'>  <Button className='w-full rounded-2xl font-bold' variant='secondary'>Documentation</Button></a>
        </div>
    )
}

export default Sidebar;
import React from 'react';
import { UserIcon, HomeIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { Card } from './card';
import { Button } from './button';
import Image from 'next/image';

const Sidebar = () => {
    return (
        <div className='p-10'>
            <div>
                <div className='flex justify-start items-center gap-2'>
                    <Image
                        src="/assets/group.svg"
                        width={40}
                        height={40}
                        alt='logo'
                    />
                    <p className='text-[1.5rem] font-semi-bold'>NetZero</p>
                </div>
            </div>
            <div className='flex flex-col mt-7'>
                <div
                    className="h-16 w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent"
                    style={{ height: '1px' }}
                ></div>
                <div className='flex flex-col gap-4 mt-6'>
                    <SideBarItem icon={<Image src="/assets/Active-Profile.svg" alt="Profile active icon" width={42} height={43} />} text={"Profile"} active={true} />
                    <SideBarItem icon={<Image alt="home svg" src="/assets/home-unactive.svg" width={42} height={42} />} text={"Home"} active={false} />
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
            <Button className='w-full rounded-2xl font-bold' variant='secondary'>Documentation</Button>
        </div>
    )
}

export default Sidebar;
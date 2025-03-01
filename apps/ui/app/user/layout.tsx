import Sidebar from "@/components/sidebar";

export default function UserScreensLayout(
    { children }: { children: React.ReactNode }
) {
    return (
        <div className="flex flex-col h-full">
            <div className="w-[350px] h-full">
                <Sidebar />
            </div>
            {children}
        </div>
    )
}
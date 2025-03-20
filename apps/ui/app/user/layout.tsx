import { Footer } from "@/components/footer";
import Sidebar from "@/components/sidebar";

export default function UserScreensLayout(
    { children }: { children: React.ReactNode }
) {
    return (
        <div className="flex h-screen justify-between flex-col">
            <div className="flex justify-center items-center">
                <div className="w-[350px]">
                    <Sidebar />
                </div>
                {children}
            </div>
            <Footer />
        </div>
    )
}
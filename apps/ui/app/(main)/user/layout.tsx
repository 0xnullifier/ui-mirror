import { Footer } from "@/components/footer";
import Sidebar from "@/components/sidebar";

export default function UserScreensLayout(
    { children }: { children: React.ReactNode }
) {
    console.log("here")
    return (
        <div className="flex h-screen justify-between flex-col">
            <div className="flex">
                <div className="w-[350px]">
                    <Sidebar />
                </div>
                {children}
            </div>
            <Footer />
        </div>
    )
}
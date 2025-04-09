import { Button } from "@/components/button";
import { MinaGradientText } from "@/components/token-name";
import Link from "next/link";

const HomePage = () => {
    return (
        <>
            <div
                className="h-screen w-full flex flex-col items-center justify-center"
                style={{
                    background: `url(/assets/home-background.svg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <h1 className="text-8xl uppercase mb-4  tracking-tight bg-gradient-to-r from-[#D36A46] to-[#8E64CD] bg-clip-text text-transparent font-bold">NetZero</h1>
                <p className="text-2xl font-medium text-secondary-foreground mb-8">
                    Proof of Solvency{" "}
                    <MinaGradientText text="MINA" />
                </p>
                <Link href="/login">
                    <Button className="rounded-full px-8 text-base border font-medium" variant="secondary" >
                        Get Started
                    </Button>
                </Link>
            </div>
        </>
    );
};

export default HomePage;
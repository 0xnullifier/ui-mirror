import { MinaGradientText } from "./token-name"

export type Status = "Generating Proof" | "Verifying onChain" | "Proof Verified" | "Failed"
export const StatusText = ({ status }: { status: Status }) => {
    return (
        <>
            {
                status === "Generating Proof" ? (
                    <p className="text-[#D36A46] font-bold">{status}</p>
                ) : status === "Verifying onChain" ? (
                    <p className="font-bold">Verifying <MinaGradientText text="OnChain" /></p>
                ) : status === "Proof Verified" ? (
                    <p className="text-[#68D391] font-bold">{status}</p>
                ) : (
                    <p className="text-[#FF070B] font-bold">{status}</p>
                )
            }
        </>
    )
}

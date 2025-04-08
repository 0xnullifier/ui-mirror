import Image from "next/image"
import { TokenText } from "./token-name"

export const CompanyRowItem = ({ name, icon, token }: { name: string, icon: string, token?: string }) => {
    return (
        <div className="flex justify-start items-center text-[1.15rem]">
            <Image src={icon} alt="Dummy Cex" width={20} height={20} />
            <span className="mx-2">{name}  {token && <TokenText text={token} />}</span>
        </div>
    )
}


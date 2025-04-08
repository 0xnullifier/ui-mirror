import { CustodianDataWrapper } from "@/components/CustodianDataWrapper";


export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    console.log("custodian layout")
    return (
        // add font to className, also add antialiased and dark m
        <>
            <CustodianDataWrapper>
                {children}
            </CustodianDataWrapper>
        </>
    );
}
import { CustodianDataWrapper } from "@/components/CustodianDataWrapper";
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // add font to className, also add antialiased and dark mode
        <CustodianDataWrapper>
            {children}
        </CustodianDataWrapper>
    );
}
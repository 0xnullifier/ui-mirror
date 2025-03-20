"use client";
import { CUSTODIAN_ASSETS, GET_CUSTODIANS_URL } from "@/lib/endpoint";
import useStore, { Custodian } from "@/lib/store";
import axios from "axios";
import { useEffect } from "react";

export const CustodianDataWrapper = ({ children }: { children: React.ReactNode }) => {
    const { setCustodians, } = useStore();

    useEffect(() => {
        const fetchCustodians = async () => {
            try {
                const response = await axios.get(GET_CUSTODIANS_URL);
                const custodians: Custodian[] = response.data.exchanges;
                console.log(custodians);
                setCustodians(custodians);
                const custodianWithAssets: Custodian[] = [...custodians]
                // fetch custodian assets from the custodian backend
                custodians.forEach(async (custodian, index: number) => {
                    const assets = await axios.get(
                        CUSTODIAN_ASSETS(custodian.backendurl)
                    );
                    console.log(assets.data.assets);
                    custodian.assets = assets.data.assets;
                })
                setCustodians(custodianWithAssets)
            } catch (error) {
                console.error("Failed to fetch custodians:", error);
            }
        };

        fetchCustodians();
    }, []);

    return <>{children}</>;
};

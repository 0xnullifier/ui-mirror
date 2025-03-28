"use client";
import { CUSTODIAN_ASSETS, CUSTODIAN_GET_CONTRACTS, GET_CUSTODIANS_URL, GET_USER } from "@/lib/endpoint";
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
                    const contracts = await axios.get(
                        CUSTODIAN_GET_CONTRACTS(custodian.backendurl)
                    );
                    custodian.assets = assets.data.assets;
                    custodian.assetsZkAppAddress = contracts.data.assetVerifier
                    custodian.posZkAppAddress = contracts.data.posVerifier
                    custodian.liabilitiesZkAppAddress = contracts.data.liabilitiesVerifier
                    console.log(custodian)
                })
                setCustodians(custodianWithAssets)
            } catch (error) {
                console.error("Failed to fetch custodians:", error);
            }
        };
        const fetchUser = async () => {
            console.log(document.cookie)
            // const user = await axios.get(GET_USER,
            //     {
            //         withCredentials: true
            //     })
            // console.log(user)
        }
        fetchCustodians();
        fetchUser();
    }, []);

    return <>{children}</>;
};

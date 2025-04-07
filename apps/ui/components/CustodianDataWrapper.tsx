"use client";
import { CUSTODIAN_ASSETS, CUSTODIAN_GET_CONTRACTS, GET_CUSTODIANS_URL, GET_USER } from "@/lib/endpoint";
import { toast } from "@/lib/hooks/useToast";
import useStore, { Custodian } from "@/lib/store";
import axios, { AxiosError } from "axios";
import { headers } from "next/headers";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react"

export const CustodianDataWrapper = ({ children }: { children: React.ReactNode }) => {
    const { setCustodians, setUser } = useStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchCustodians = async () => {
            try {
                const response = await axios.get(GET_CUSTODIANS_URL);
                //TODO: delete some exchanges from the list
                const custodians: Custodian[] = response.data.exchanges.slice(3);
                console.log(custodians)
                setCustodians(custodians);
                const custodianWithAssets: Custodian[] = [...custodians]
                // fetch custodian assets from the custodian backend
                const assetPromises = custodians.map(async (custodian, index: number) => {
                    const assets = await axios.get(
                        CUSTODIAN_ASSETS(custodian.backendurl)
                    );
                    console.log(assets)
                    const contracts = await axios.get(
                        CUSTODIAN_GET_CONTRACTS(custodian.backendurl)
                    );
                    console.log(contracts)
                    custodian.assets = assets.data.assets;
                    custodian.assetsZkAppAddress = contracts.data.assetVerifier
                    custodian.posZkAppAddress = contracts.data.solvencyVerifier
                    custodian.liabilitiesZkAppAddress = contracts.data.liabilitiesVerifier

                    console.log(custodian)
                    // feth analytics data such as last transaction of the posZkAppAddress
                    // this will expose my api-key good for now else move to backend
                    const options = { method: 'GET', headers: { accept: 'application/json' } };
                    if (contracts.data.solvencyVerifier) {
                        console.log("doing api call for history")
                        const res = await axios.get(`https://api.blockberry.one/mina-devnet/v1/zkapps/accounts/${contracts.data.solvencyVerifier}/txs?page=0&size=3&orderBy=DESC&sortBy=AGE`, {
                            headers: {
                                "Accept": "application/json",
                                "x-api-key": "RWnPTUV0hahXFYrVjJcC1WE6ZM8J7D"
                            }
                        })
                        console.log(res.data.data[0].hash)
                        custodian.txs = res.data?.data?.map((tx: any) => {
                            console.log(tx.hash)
                            return { hash: tx.hash }
                        })
                    }
                    return custodian;
                });

                const updatedCustodians = await Promise.all(assetPromises);
                setCustodians(updatedCustodians);
                return true;
            } catch (error) {
                console.error("Failed to fetch custodians:", error);
                return false;
            }
        };

        const fetchUser = async () => {
            try {
                const res = await axios.get(GET_USER,
                    {
                        withCredentials: true,
                    })
                if (res.status === 200) {
                    setUser({
                        id: res.data.user.id,
                        email: res.data.user.email,
                    })
                } else {
                    toast({
                        title: "Error",
                        description: "You are not logged in. Please login to continue.",
                        variant: "error"
                    })
                    // router.push("/login")
                }
                return true;
            } catch (error: any) {
                if (error.response?.status === 401) {
                    toast({
                        title: "Error",
                        description: "You are not logged in. Please login to continue.",
                        variant: "error"
                    })
                    // router.push("/login")
                }
                console.error("Failed to fetch user:", error);
                return false;
            }
        }

        Promise.all([fetchCustodians(), fetchUser()])
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen w-full">
            {loading ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
                    <div className="relative" style={{ perspective: "800px" }}>
                        <motion.div
                            className="w-24 h-24 relative"
                            animate={{
                                rotateX: [0, 360],
                                rotateY: [0, 360]
                            }}
                            transition={{
                                duration: 4,
                                ease: "easeInOut",
                                repeat: Infinity,
                            }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Front face */}
                            <motion.div
                                className="absolute w-full h-full bg-primary/80 rounded-md shadow-lg"
                                initial={{ transform: "translateZ(12px)" }}
                                animate={{
                                    scale: [1, 0.8, 1],
                                    rotateZ: [0, 15, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 0
                                }}
                                style={{ backfaceVisibility: "hidden" }}
                            />
                            {/* Back face */}
                            <motion.div
                                className="absolute w-full h-full bg-primary/60 rounded-md shadow-lg"
                                initial={{ transform: "rotateY(180deg) translateZ(12px)" }}
                                animate={{
                                    scale: [1, 0.9, 1],
                                    rotateZ: [0, -15, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 0.5
                                }}
                                style={{ backfaceVisibility: "hidden" }}
                            />
                            {/* Top face */}
                            <motion.div
                                className="absolute w-full h-full bg-primary/70 rounded-md shadow-lg"
                                initial={{ transform: "rotateX(90deg) translateZ(12px)" }}
                                animate={{
                                    scale: [1, 0.85, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 1
                                }}
                                style={{ backfaceVisibility: "hidden" }}
                            />
                            {/* Bottom face */}
                            <motion.div
                                className="absolute w-full h-full bg-primary/70 rounded-md shadow-lg"
                                initial={{ transform: "rotateX(-90deg) translateZ(12px)" }}
                                animate={{
                                    scale: [1, 0.85, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 1.5
                                }}
                                style={{ backfaceVisibility: "hidden" }}
                            />
                        </motion.div>
                    </div>
                    <p className="absolute mt-40 text-lg font-medium text-primary animate-pulse">Loading...</p>
                </div>
            ) : (
                children
            )}
        </div>
    );
};

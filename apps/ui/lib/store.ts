import { create } from "zustand"


export interface Custodian {
    name: string;
    logo: string;
    backendurl: string;
    assets: string[];
    liabilitiesZkAppAddress: string;
    assetsZkAppAddress: string;
    posZkAppAddress: string;
    txs?: any;
}


export interface User {
    id: string;
    email: string;
}


interface Store {
    custodians: Custodian[];
    user: User | null;
    setUser: (user: User | null) => void;
    setCustodians: (custodians: Custodian[]) => void;
    addCustodian: (custodian: Custodian) => void;
    removeCustodian: (custodian: Custodian) => void;
}

const useStore = create<Store>((set) => ({
    custodians: [],
    setCustodians: (custodians: Custodian[]) => set({ custodians }),
    addCustodian: (custodian: Custodian) =>
        set((state) => ({
            custodians: [...state.custodians, custodian],
        })),
    removeCustodian: (custodian: Custodian) =>
        set((state) => ({
            custodians: state.custodians.filter((c) => c !== custodian),
        })),
    clearCustodians: () => set({ custodians: [] }),
    user: null,
    setUser: (user: User | null) => set({
        user
    })
}))
export default useStore

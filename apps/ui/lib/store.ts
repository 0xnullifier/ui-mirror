import { create } from "zustand"


export interface Custodian {
    name: string;
    logo: string;
    backendurl: string;
    assets: string[];
}
interface Store {
    custodians: Custodian[];
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
}))
export default useStore

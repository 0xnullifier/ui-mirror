import { AreaChart } from "./areaChart";

const dummyChartData = [
    {
        date: "Jan 2025 Week 1",
        ProofsGenerated: 2500,
        LiabilitiesVerified: 10000,
    },
    {
        date: "Jan 2025 Week 2",
        ProofsGenerated: 3000,
        LiabilitiesVerified: 12000,
    },
    {
        date: "Jan 2025 Week 3",
        ProofsGenerated: 2000,
        LiabilitiesVerified: 9000,
    },
    {
        date: "Jan 2025 Week 4",
        ProofsGenerated: 3500,
        LiabilitiesVerified: 11000,
    },
    {
        date: "Feb 2025 Week 1",
        ProofsGenerated: 6890,
        LiabilitiesVerified: 52575,
    },
    {
        date: "Feb 2025 Week 2",
        ProofsGenerated: 7000,
        LiabilitiesVerified: 53000,
    },
    {
        date: "Feb 2025 Week 3",
        ProofsGenerated: 6800,
        LiabilitiesVerified: 52000,
    },
    {
        date: "Feb 2025 Week 4",
        ProofsGenerated: 7100,
        LiabilitiesVerified: 54000,
    },
    {
        date: "Mar 2025 Week 1",
        ProofsGenerated: 2500,
        LiabilitiesVerified: 25000,
    },

]

export const Chart = ({ chartData }: {
    chartData: {
        date: string;
        ProofsGenerated: number;
        LiabilitiesVerified: number;
    }[]
} = { chartData: dummyChartData }) => {

    return (
        <div className="flex flex-col gap-16 bg-white px-10 py-20 rounded-3xl w-[50%] h-full center">
            <p className="text-2xl font-bold">Proofs Generated</p>
            <AreaChart
                type={"default"}
                className="font-bold h-full"
                data={chartData}
                index="date"
                categories={["ProofsGenerated", "LiabilitiesVerified"]}
                colors={["orangeMina", "purpleMina"]}
                showLegend={false}
                fill="gradient"
                yAxisLabel="Number of Proofs"
                yAxisWidth={50}
            />
        </div>
    )
}
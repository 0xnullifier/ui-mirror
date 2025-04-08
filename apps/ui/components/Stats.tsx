import { Card } from "./card";

export const Stats = ({ stats }: {
    stats: {
        title: string;
        value: string;
        percetageChange: number;
        icon: React.JSX.Element;
    }[]
}) => {
    return (
        <div>
            <ul className="flex gap-10">
                {stats.map((item, index) => (
                    <Stat key={index} title={item.title} value={item.value} percetageChange={item.percetageChange} icon={item.icon} />
                ))}
            </ul>
        </div>
    )
}

export const Stat = ({
    title,
    value,
    percetageChange,
    icon
}: {
    title: string
    value: string
    percetageChange: number
    icon: React.ReactNode
}) => {
    return (
        <Card asChild className="rounded-3xl">
            <li className="flex gap-2">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <p className="text-[0.85rem] text-[#A0AEC0] font-bold">{title}</p>
                        <p className="text-2xl font-bold">{value}<span className={percetageChange > 0 ? "text-green-500 pl-2 text-[0.95rem]" : "text-red-500 pl-2 text-[0.95rem]"}>{percetageChange > 0 ? "+" : "-"}{Math.abs(percetageChange)} %</span></p>
                    </div>
                    <div>
                        {icon}
                    </div>
                </div>
            </li>
        </Card>
    )
}

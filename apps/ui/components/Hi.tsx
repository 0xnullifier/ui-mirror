
export const Hi = ({ userName }: { userName: string }) => {
    return (
        <div className="flex justify-between items-center mb-10 ml-2">
            <p className="text-4xl font-bold">Hi, {userName} <span className="px-1"></span> 👋</p>
        </div>
    )
}


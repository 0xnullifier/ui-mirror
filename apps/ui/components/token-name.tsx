export const MinaGradientText = ({ text }: { text: string }) => {
    return (
        <span className="bg-gradient-to-r from-[#D36A46] to-[#8E64CD] bg-clip-text text-transparent font-bold">
            {text}
        </span>
    );
}

export const TokenText = ({ text }: { text: string }) => {
    return (
        <>
            {text.toUpperCase() === "MINA" ? (<MinaGradientText text={text} />) : (
                <span className="font-extrabold">{text}</span>
            )}
        </>
    )
}
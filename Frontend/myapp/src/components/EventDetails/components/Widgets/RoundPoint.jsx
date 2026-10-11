function RoundPont({ icon, title, value }) {
    return (
        <section className="py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-teal-400 text-4xl mb-3">{icon}</div>
                <h3 className="font-bold text-lg mb-1 text-white">{title}</h3>
            </div>

        </section>

    )
}
export default RoundPont;
const scroll = (scrollRef, direction) => {
    if (!scrollRef?.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    const scrollTo =
        direction === "left"
            ? scrollLeft - clientWidth * 0.8
            : scrollLeft + clientWidth * 0.8;

    scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
    });
};

export default scroll;

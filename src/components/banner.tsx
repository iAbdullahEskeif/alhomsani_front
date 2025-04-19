import { useState, useEffect, useRef } from "react";
import { Gauge } from "lucide-react";

const Banner = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [nextIndex, setNextIndex] = useState<number>(1);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(0); // <- NEW
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const transitionTimeout = setTimeout(() => {
            const newIndex = (currentIndex + 1) % images.length;
            setNextIndex(newIndex);
            setActiveIndex(newIndex); // show immediately in indicator
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(newIndex);
                setIsTransitioning(false);
            }, 1500); // Match transition duration
        }, 8000);

        return () => {
            clearTimeout(transitionTimeout);
        };
    }, [currentIndex, images.length]);

    const handleIndicatorClick = (index: number) => {
        if (index === currentIndex || isTransitioning) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setNextIndex(index);
        setActiveIndex(index); // show immediately in indicator
        setIsTransitioning(true);

        timeoutRef.current = setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 1500); // Match transition duration
    };

    return (
        <div className="relative w-full h-96 overflow-hidden bg-zinc-950">
            <div
                key={currentIndex}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"
                    }`}
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
            ></div>

            {isTransitioning && (
                <div
                    key={nextIndex}
                    className="absolute inset-0 bg-cover bg-center opacity-0 animate-fadeIn"
                    style={{ backgroundImage: `url(${images[nextIndex]})` }}
                ></div>
            )}

            <div className="absolute inset-0 bg-zinc-950/80"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <h1 className="text-4xl md:text-5xl font-medium tracking-wider mb-4 text-white">
                    Luxury Automotive
                </h1>
                <p className="text-amber-300/80 text-lg md:text-xl max-w-2xl text-center px-4">
                    Engineered for those who drive the extraordinary
                </p>
                <div className="mt-8 text-amber-600">
                    <Gauge className="h-8 w-8" />
                </div>

                <div className="absolute bottom-8 flex space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleIndicatorClick(index)}
                            className={`h-2 rounded-full transition-all duration-500 ${index === activeIndex ? "bg-amber-500 w-6" : "bg-zinc-600 w-2"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Banner;

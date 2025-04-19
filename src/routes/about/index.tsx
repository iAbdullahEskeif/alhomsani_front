import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";
import { useIsVisible } from "@/components/hooks/useisvisible";
import { Award, Shield, PenToolIcon as Tool, Gauge } from "lucide-react";

function About() {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useIsVisible(ref);

    return (
        <div className="min-h-screen bg-zinc-950">
            <div
                ref={ref}
                className={`max-w-6xl mx-auto p-8 transition-opacity ease-in duration-500 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                <h2 className="text-3xl font-medium text-white mb-8">About Us</h2>

                <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300 mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl text-white font-medium flex items-center">
                            <Gauge className="mr-2 text-amber-600" />
                            Our Story
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-zinc-400 mb-4">
                            Welcome to Luxury Automotive, where passion meets precision. We
                            specialize in curating the finest collection of luxury, classic,
                            and electric vehicles for the discerning automotive enthusiast.
                        </p>
                        <p className="text-zinc-400 mb-4">
                            Our team of experts meticulously selects each vehicle in our
                            inventory, ensuring that only the most exceptional automobiles
                            bear our <span className="text-amber-400">mark of approval</span>.
                        </p>
                        <p className="text-zinc-400">
                            With decades of combined experience in the luxury automotive
                            industry, we pride ourselves on providing an unparalleled
                            purchasing experience that matches the caliber of our vehicles.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300">
                        <CardContent className="pt-6">
                            <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Award className="size-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">
                                Excellence
                            </h3>
                            <p className="text-zinc-400">
                                We maintain the highest standards in vehicle selection, ensuring
                                each car meets our rigorous quality criteria.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300">
                        <CardContent className="pt-6">
                            <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Tool className="size-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Expertise</h3>
                            <p className="text-zinc-400">
                                Our team brings decades of specialized knowledge in luxury,
                                classic, and electric vehicles to serve you better.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300">
                        <CardContent className="pt-6">
                            <div className="size-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Shield className="size-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Trust</h3>
                            <p className="text-zinc-400">
                                We build lasting relationships with our clients based on
                                transparency, integrity, and exceptional service.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute("/about/")({
    component: About,
});

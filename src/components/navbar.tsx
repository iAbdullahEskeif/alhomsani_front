import type React from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
    Menu,
    X,
    LogOut,
    LogIn,
    Home,
    Info,
    Mail,
    Gauge,
    User,
} from "lucide-react";
import { useAuth, SignInButton, SignOutButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const { isSignedIn } = useAuth();

    return (
        <nav className="bg-zinc-950 border-b border-zinc-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link
                    to="/"
                    className="text-white text-lg font-medium flex items-center"
                >
                    <Gauge className="mr-2 text-amber-600" size={20} />
                    <span>Luxury Automotive</span>
                </Link>

                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-amber-500 hover:text-amber-300 hover:bg-zinc-800"
                        >
                            <Menu size={20} />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="bg-zinc-900 border-zinc-800 p-0"
                    >
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <Link
                                        to="/"
                                        className="text-white font-medium flex items-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Gauge className="mr-2 text-amber-600" size={18} />
                                        <span>Luxury Automotive</span>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-amber-500 hover:text-amber-300 hover:bg-zinc-800"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <X size={18} />
                                        <span className="sr-only">Close menu</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto py-4">
                                <div className="space-y-1 px-2">
                                    <Link
                                        to="/"
                                        className="flex items-center p-3 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                        activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                                    >
                                        <Home className="mr-3 size-5" />
                                        Home
                                    </Link>
                                    <Link
                                        to="/about"
                                        className="flex items-center p-3 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                        activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                                    >
                                        <Info className="mr-3 size-5" />
                                        About
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="flex items-center p-3 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                        activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                                    >
                                        <Mail className="mr-3 size-5" />
                                        Contact
                                    </Link>
                                    {isSignedIn && (
                                        <Link
                                            to="/profile"
                                            className="flex items-center p-3 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                            activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                                        >
                                            <User className="mr-3 size-5" />
                                            Profile
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-zinc-800">
                                {isSignedIn ? (
                                    <SignOutButton redirectUrl="/">
                                        <Button
                                            variant="secondary"
                                            className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600 justify-start"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LogOut className="mr-2 size-4" />
                                            Logout
                                        </Button>
                                    </SignOutButton>
                                ) : (
                                    <SignInButton mode="modal">
                                        <Button
                                            variant="secondary"
                                            className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600 justify-start"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LogIn className="mr-2 size-4" />
                                            Login
                                        </Button>
                                    </SignInButton>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="hidden md:flex items-center space-x-1">
                    <Link
                        to="/"
                        className="px-3 py-2 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors flex items-center"
                        activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                    >
                        <Home className="mr-1 size-4" />
                        Home
                    </Link>
                    <Link
                        to="/about"
                        className="px-3 py-2 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors flex items-center"
                        activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                    >
                        <Info className="mr-1 size-4" />
                        About
                    </Link>
                    <Link
                        to="/contact"
                        className="px-3 py-2 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors flex items-center"
                        activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                    >
                        <Mail className="mr-1 size-4" />
                        Contact
                    </Link>
                    {isSignedIn && (
                        <Link
                            to="/profile"
                            className="px-3 py-2 text-zinc-400 hover:text-amber-200 hover:bg-zinc-800 rounded-md transition-colors flex items-center"
                            activeProps={{ className: "bg-zinc-800 text-amber-300" }}
                        >
                            <User className="mr-1 size-4" />
                            Profile
                        </Link>
                    )}

                    <div className="ml-2">
                        {isSignedIn ? (
                            <SignOutButton redirectUrl="/">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                                >
                                    <LogOut className="mr-1 size-4" />
                                    Logout
                                </Button>
                            </SignOutButton>
                        ) : (
                            <SignInButton mode="modal">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                                >
                                    <LogIn className="mr-1 size-4" />
                                    Login
                                </Button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

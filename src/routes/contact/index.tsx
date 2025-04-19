import type React from "react";

import { useIsVisible } from "@/components/hooks/useisvisible";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

function Contact(){
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(ref);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formState);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto p-8 transition-opacity ease-in duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-3xl font-medium text-white mb-8">Contact Us</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-white font-medium">
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-400">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 focus:ring-amber-500/20"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-400">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 focus:ring-amber-500/20"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-zinc-400">
                      Phone (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 focus:ring-amber-500/20"
                      value={formState.phone}
                      onChange={(e) =>
                        setFormState({ ...formState, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-zinc-400">
                    Subject
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setFormState({ ...formState, subject: value })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 focus:ring-amber-500/20">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="sales">Vehicle Sales</SelectItem>
                      <SelectItem value="service">
                        Service & Maintenance
                      </SelectItem>
                      <SelectItem value="parts">Parts & Accessories</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-400">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 focus:ring-amber-500/20 min-h-[120px]"
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full bg-amber-700 text-amber-100 border-amber-600 hover:bg-amber-600"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-white font-medium">
                  Visit Our Showroom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-zinc-400">
                  <p className="flex items-start">
                    <MapPin className="size-5 text-amber-600 mr-2 mt-0.5" />
                    <span>123 Luxury Lane, Prestige City, PC 12345</span>
                  </p>
                  <p className="flex items-start">
                    <Phone className="size-5 text-amber-600 mr-2 mt-0.5" />
                    <span>+1 (555) 123-4567</span>
                  </p>
                  <p className="flex items-start">
                    <Mail className="size-5 text-amber-600 mr-2 mt-0.5" />
                    <span>contact@luxuryautomotive.com</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 shadow-md hover:border-amber-800/30 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-white font-medium">
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <Clock className="size-4 text-amber-600 mr-2" />
                      Monday - Friday
                    </span>
                    <span className="text-amber-300">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <Clock className="size-4 text-amber-600 mr-2" />
                      Saturday
                    </span>
                    <span className="text-amber-300">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <Clock className="size-4 text-amber-600 mr-2" />
                      Sunday
                    </span>
                    <span className="text-amber-300">By Appointment Only</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/contact/")({
  component: Contact,
});

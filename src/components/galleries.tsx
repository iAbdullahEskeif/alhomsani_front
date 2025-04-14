import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface GalleryItem {
  name: string;
  path: string;
}

interface Gallery {
  title: string;
  items: GalleryItem[];
}

const Galleries = () => {
  const galleries: Gallery[] = [
    {
      title: "Available Products",
      items: [
        { name: "Classic Cars", path: "/cars/classiccars" },
        { name: "Luxury Cars", path: "/cars/luxurycars" },
        { name: "Electrical Cars", path: "/cars/electricalcars" },
      ],
    },
    {
      title: "Upcoming Models",
      items: [
        { name: "2025 Concept Cars", path: "cars/conceptcars" },
        { name: "Future Classics", path: "cars/futureclassicCars" },
      ],
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 px-4 pb-16">
      <h2 className="text-2xl font-medium text-amber-200 mb-6">
        Vehicle Categories
      </h2>

      <Accordion type="multiple" className="space-y-4">
        {galleries.map((gallery: Gallery, index: number) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-zinc-800 rounded-lg bg-zinc-900 px-0 hover:border-amber-800/50"
          >
            <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-zinc-800 rounded-t-lg data-[state=open]:rounded-b-none data-[state=open]:border-b data-[state=open]:border-zinc-800 data-[state=open]:text-amber-300">
              <span className="font-medium">{gallery.title}</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3 px-4">
              <div className="space-y-2">
                {gallery.items.map((item: GalleryItem, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="pb-2 border-b border-zinc-800 last:border-0 last:pb-0"
                  >
                    <Link
                      to={item.path}
                      className="text-zinc-300 hover:text-amber-200 hover:bg-zinc-800 block px-2 py-1.5 rounded-md transition-colors"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Galleries;

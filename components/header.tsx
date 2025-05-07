import { Search, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-[#2b2d30] border-b border-[#323438] py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <div className="relative w-8 h-8 mr-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fc5fa3] to-[#f97e3d] rounded-md"></div>
              <div className="absolute inset-[2px] bg-[#2b2d30] rounded-[3px] flex items-center justify-center">
                <span className="text-white font-bold text-sm">PO</span>
              </div>
            </div>
            <span className="font-bold text-lg">PyBebra</span>
          </div>
        </div>
      </div>
    </header>
  );
}

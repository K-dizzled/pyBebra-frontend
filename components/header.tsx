import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-[#2b2d30] border-b border-[#323438] py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <Image
              src="/pybebra-logo.png"
              alt="PyBebra Logo"
              width={45}
              height={45}
              className="mr-2 rounded-md"
            />
            <span className="font-bold text-lg">PyBebra</span>
          </div>
        </div>
      </div>
    </header>
  );
}

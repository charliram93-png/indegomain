"use client"

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 z-50 flex items-center justify-between px-6 md:px-12 bg-[#D6D8C2]/70 backdrop-blur-md">
      
      {/* LOGO 
          - select-none: Evita el resaltado azul.
      */}
      <div className="flex items-center select-none">
        <Link href="/" className="select-none">
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772763867/LogoWhatsMetaData_jmp0lg.png" 
            width={100}
            height={100}
            alt="Logo"
            /* pointer-events-none en la imagen evita que sea "arrastrable" */
            className="w-20 h-20 object-contain select-none pointer-events-none"
          />
        </Link>
      </div>

      {/* ICONO BOLSA 
          - select-none: Protege el botón y el número del contador.
      */}
      <div className="flex items-center select-none">
        <button className="relative p-2 text-[#32331F] rounded-full transition-all select-none outline-none">
          {/* Icono protegido */}
          <ShoppingBag size={24} strokeWidth={1.5} className="select-none pointer-events-none" />
          
          {/* Contador de productos */}
          <span className="absolute top-1 right-1 bg-[#32331F] text-[#D6D8C2] text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold select-none pointer-events-none">
            0
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
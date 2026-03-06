"use client"

import Link from "next/link";

const Footer: React.FC = () => {
  return (
    /* bg-transparent asegura que no haya fondo negro ni blanco */
    <footer className="w-full mt-auto py-12 px-6 bg-transparent">
      <div className="flex flex-col items-center justify-center gap-4">
        
        {/* ENLACES CENTRALES */}
        <div className="flex items-center gap-8 text-[#32331F] font-medium text-[10px] md:text-[11px] tracking-[0.2em] uppercase">
          <Link 
            href="/terms" 
            className="hover:opacity-40 transition-opacity"
          >
            Terms
          </Link>
          
          <Link 
            href="https://linktr.ee/INDEGOSTUDIO" 
            target="_blank" 
            className="hover:opacity-40 transition-opacity"
          >
            Linktree
          </Link>
        </div>

        {/* COPYRIGHT O MARCA */}
        <p className="text-[#32331F] opacity-30 text-[9px] uppercase">
          © 2026 INDEGO STUDIO
        </p>
      </div>
    </footer>
  );
};

export default Footer;
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main
      className="relative flex h-dvh w-full flex-col items-center justify-center text-white text-center px-6 overflow-hidden"
      style={{
        backgroundColor: "#32331F",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
    >
      {/* LOGO ESQUINA */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="https://indegostudio.com" 
          target="_blank" // Opcional: abre en pestaña nueva
          rel="noopener noreferrer" // Seguridad para enlaces externos
          className="transition-opacity hover:opacity-100 opacity-80"
        >
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"
            width={60}
            height={60}
            alt="Logo Indego Studio"
            className="w-10 h-10 md:w-16 md:h-16"
          />
        </Link>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-6 md:gap-10">
        
        {/* 1. SECCIÓN SUPERIOR: LOGOS */}
        <div className="w-full max-w-65 md:max-w-sm space-y-3">
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755253/LogoHev_White_db30dd.png"
            width={500}
            height={200}
            alt="logo hev"
            className="w-full h-auto"
            priority
          />
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755266/LogoKids_White_ril01y.png"
            width={500}
            height={200}
            alt="logo kids"
            className="w-full h-auto px-6 md:px-10" 
          />
        </div>

        {/* 2. SECCIÓN TEXTOS + LOGO INFERIOR */}
        <div className="flex flex-col items-center w-full">
          {/* Usamos min-content para que el div mida exactamente lo que mide el H1 en una sola línea */}
          <div className="w-fit text-left">
            <h1 className="text-lg md:text-3xl font-bold whitespace-nowrap">
              UNDER CONSTRUCTION
            </h1>
            
            {/* Renglón: DROP #1 y COMING SOON alineados a los bordes */}
            <div className="flex justify-between w-full mt-1">
              <p className="text-[9px] md:text-[13px] tracking-tight opacity-70">DROP #1</p>
              <p className="text-[9px] md:text-[13px] tracking-tight opacity-70">COMING SOON</p>
            </div>

            {/* Logo inferior */}
            <div className="w-full flex justify-center mt-6">
              <Image
                src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png"
                width={100}
                height={35}
                alt="logo indg"
                className="w-20 md:w-28 h-auto opacity-90"
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
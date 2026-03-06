import Image from "next/image"

export default function Home() {
  return (
    <main
      className="relative flex h-[100dvh] w-full flex-col items-center justify-between text-white text-center px-6 overflow-hidden py-8 md:py-16"
      style={{
        backgroundColor: "#32331F",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
    >
      {/* LOGO ESQUINA - Tamaño responsivo */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"
          width={80}
          height={80}
          alt="Logo"
          className="w-10 h-10 md:w-20 md:h-20" // Pequeño en mobile, normal en desktop
        />
      </div>

      {/* 1. SECCIÓN SUPERIOR: LOGOS HEV & KIDS */}
      <div className="w-full max-w-[280px] md:max-w-md space-y-2 md:space-y-4 mt-12 md:mt-0">
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
          className="w-full h-auto px-4 md:px-8" 
        />
      </div>

      {/* 2. SECCIÓN CENTRAL: TEXTO */}
      <div className="flex flex-col items-center">
        <h1 className="text-lg md:text-4xl tracking-[0.2em] font-bold">
          UNDER CONSTRUCTION
        </h1>
        <div className="mt-2 md:mt-4 space-y-0.5 md:space-y-1">
          <p className="text-[10px] md:text-lg tracking-widest opacity-80">DROP #1</p>
          <p className="text-[10px] md:text-lg tracking-widest opacity-80">COMING SOON</p>
        </div>
      </div>

      {/* 3. SECCIÓN INFERIOR: LOGO FINAL (Indg Cd) */}
      <div className="w-24 md:w-32 mb-4"> 
        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png"
          width={120}
          height={40}
          alt="logo indg"
          className="w-full h-auto"
        />
      </div>
    </main>
  )
}
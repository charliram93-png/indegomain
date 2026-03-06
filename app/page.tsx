import Image from "next/image"

export default function Home() {
  return (
    // Cambiamos min-h-screen por h-screen y añadimos overflow-hidden
    <main
      className="relative flex h-screen w-full flex-col items-center justify-center text-white text-center px-6 overflow-hidden"
      style={{
        backgroundColor: "#32331F",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
    >
      {/* LOGO esquina - Ajustado para no interferir con el flujo */}
      <div className="absolute top-6 left-6">
        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"
          width={60} // Reducido un poco para mobile
          height={60}
          alt="Logo"
          className="w-auto h-auto"
        />
      </div>

      {/* Contenedor principal con flex-1 y justify-evenly para distribuir espacio */}
      <div className="flex flex-col items-center justify-evenly h-full w-full max-w-md py-12">
        
        {/* Sección Logos Superiores */}
        <div className="w-full space-y-4">
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755253/LogoHev_White_db30dd.png"
            width={400}
            height={150}
            alt="logo hev"
            className="w-full h-auto px-4"
            priority
          />
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755266/LogoKids_White_ril01y.png"
            width={400}
            height={150}
            alt="logo kids"
            className="w-full h-auto px-10" // Un poco más de padding lateral para jerarquía
          />
        </div>

        {/* Sección Texto Central */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl md:text-3xl tracking-[0.2em] font-bold">
            UNDER CONSTRUCTION
          </h1>
          <div className="mt-4 space-y-1">
            <p className="text-xs md:text-base opacity-80">DROP #1</p>
            <p className="text-xs md:text-base opacity-80">COMING SOON</p>
          </div>
        </div>

        {/* Logo Inferior */}
        <div className="w-full">
          <Image
            src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png"
            width={100}
            height={30}
            alt="logo indg"
            className="mx-auto h-auto"
          />
        </div>

      </div>
    </main>
  )
}
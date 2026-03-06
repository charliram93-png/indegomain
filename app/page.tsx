import Image from "next/image"

export default function Home() {
  return (
    <main
      className="h-screen overflow-hidden flex flex-col items-center justify-center text-white"
      style={{
        backgroundColor: "#32331F",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
    >
      {/* Logo arriba */}
      <div className="absolute top-6 left-6">
        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"
          width={70}
          height={70}
          alt="Logo"
        />
      </div>

      <div className="space-y-8 max-w-xs">

        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755253/LogoHev_White_db30dd.png"
          width={400}
          height={200}
          alt="logo"
          className="w-full h-auto"
        />

        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755266/LogoKids_White_ril01y.png"
          width={400}
          height={200}
          alt="logo"
          className="w-full h-auto"
        />

        <div className="pt-6">
          <h1 className="text-xl md:text-3xl tracking-widest">
            UNDER CONSTRUCTION
          </h1>

          <p className="text-sm mt-3">
            DROP #1
          </p>

          <p className="text-sm">
            COMING SOON
          </p>
        </div>

        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png"
          width={110}
          height={40}
          alt="logo"
          className="mx-auto"
        />

      </div>
    </main>
  )
}
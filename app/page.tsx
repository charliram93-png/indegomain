import Image from "next/image"

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center text-white text-center px-6"
      style={{
        backgroundColor: "#32331F",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
    >

      {/* LOGO esquina */}
      <Image
        src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp"
        width={80}
        height={80}
        alt="Logo"
        className="fixed top-4 left-4"
      />

      <div className="space-y-10 max-w-md">

        <div>
          <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755253/LogoHev_White_db30dd.png"
          width={500}
          height={200}
          alt="logo"
          className="w-70vw max-w-600px"
        />

        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755266/LogoKids_White_ril01y.png"
          width={500}
          height={200}
          alt="logo"
          className="w-70vw max-w-600px"
        />

        </div>

        

        <div className="pt-8">
          <h1 className="text-2xl md:text-4xl tracking-widest">
            UNDER CONSTRUCTION
          </h1>

          <p className="text-sm md:text-lg mt-4">
            DROP #1
          </p>

          <p className="text-sm md:text-lg">
            COMING SOON
          </p>
        </div>

        <Image
          src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png"
          width={120}
          height={40}
          alt="logo"
          className="mx-auto"
        />

      </div>
    </main>
  )
}
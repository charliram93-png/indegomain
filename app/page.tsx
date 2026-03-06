import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white"
      style={{
        backgroundColor: "#32331F",
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
      }}
      
    >
      <div className="header">
        <Image src="https://res.cloudinary.com/dij60ghdf/image/upload/v1772753917/Logo_White_xhx1kd.webp" width={100} height={100} alt="Logo" className="logo" 
        style={{
          position: "fixed",   /* se queda arriba */
          top: 0,
          left: 0,
          
        }}/>
      </div>

      <body className="text-center space-y-10">

        <div className="text-4xl  tracking-[0.25em] ">
          <Image src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755253/LogoHev_White_db30dd.png" width={600} height={600} alt="shirt" />
        </div>

        <div className="text-4xl  tracking-[0.25em] ">
          <Image src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755266/LogoKids_White_ril01y.png" width={600} height={600} alt="shirt" />
        </div>

        <div className="pt-12">
          <h1 className="text-4xl">
            UNDER CONSTRUCTION
          </h1>
          <div>
            <p className="text-lg mt-2">
            DROP #1
            </p>
            <p className="text-lg mt-2">
            COMING SOON
            </p>
          </div>
        </div>

        <div className="text-4xl  tracking-[0.25em] ">
          <Image src="https://res.cloudinary.com/dij60ghdf/image/upload/f_auto,q_auto/v1772755261/Indg_Cd_White_zqimyq.png" width={115} height={5
          } alt="shirt" />
        </div>

      </body>

      <header>
        
      </header>
    </main>
  );
}
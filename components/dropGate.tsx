"use client"

import { ReactNode, useEffect, useState } from "react"

export default function DropGate({ children }: { children: ReactNode }) {

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {

    const dropDate = new Date(Date.now() + 0 * 60 * 1000)

    const check = () => {
      if (new Date() >= dropDate) {
        setIsOpen(true)
      }
    }

    check()

    const interval = setInterval(check, 1000)

    

    return () => clearInterval(interval)

  }, [])

  if (!isOpen) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#32331F] text-center">
        <div>
          <h1 className="text-4xl tracking-widest">
            DROP #1
          </h1>

          <p className="mt-4 text-xl">
            LOCKED
          </p>

          <p className="text-sm mt-2">
            Unlocking soon
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
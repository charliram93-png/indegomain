"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type Lang } from "./dictionaries";
import {
  guardar,
  leerEnElCliente,
  leerEnElServidor,
  suscribir,
} from "./almacen";

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * EL IDIOMA NO SE GUARDA AQUÍ, se lee de `./almacen.ts`.
 *
 * Antes esto era un `useState` que arrancaba en inglés y un `useEffect` que
 * leía lo guardado al montar: dibujaba dos veces al entrar y era uno de los
 * seis `set-state-in-effect` que marcaba el linter. Ahora React lee el valor
 * del almacén cuando lo necesita, sin efecto de por medio.
 *
 * EL ÚNICO EFECTO QUE QUEDA es el `lang` del `<html>`, y ese SÍ es lo que un
 * efecto debe hacer: sincronizar algo de fuera de React (el DOM) con el estado.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    suscribir,
    leerEnElCliente,
    leerEnElServidor,
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => guardar(next), []);

  const toggleLang = useCallback(
    () => guardar(leerEnElCliente() === "en" ? "es" : "en"),
    [],
  );

  /* `useMemo` para no repartir un objeto nuevo en cada dibujado: sin esto, TODO
     lo que use `useI18n` se vuelve a dibujar aunque el idioma no haya cambiado. */
  const valor = useMemo(
    () => ({ lang, setLang, toggleLang, t: dictionaries[lang] }),
    [lang, setLang, toggleLang],
  );

  return <I18nContext.Provider value={valor}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  return ctx;
}

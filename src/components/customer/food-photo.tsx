"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "./customer-home.module.css";

export function FoodPhoto({ id, name, hero = false }: { id: string; name: string; hero?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={styles.photoFallback} role="img" aria-label={`${name}; photograph unavailable`}><span className="eyebrow">FROM OUR KITCHEN</span><span>{name}</span><span className="metadata">Made fresh, close by.</span></div>;
  return <Image src={`/food/${id}.webp`} alt={name} fill sizes={hero ? "(max-width: 500px) 100vw, 390px" : "220px"} priority={hero} quality={85} className={styles.foodPhoto} onError={() => setFailed(true)} />;
}

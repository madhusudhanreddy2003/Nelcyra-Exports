//page.js

import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Products from "../components/Products";


export default function Home() {
  return (
    <div >
      <Navbar />
      <Hero />
      <Products />
    </div>
  );
}


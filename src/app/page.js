import GlobalMapPage from "@/pages/globalMapPage/globalMapMain";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full h-screen">
      <GlobalMapPage />
    </div>
  );
}

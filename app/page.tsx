import dynamic from "next/dynamic";

const Election = dynamic(() => import("./mainCpn/election"), {
  ssr: false,
});

// import Election from "./mainCpn/election";
export default function Home() {
  return (
    <div className="w-full justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Election />
    </div>
  );
}

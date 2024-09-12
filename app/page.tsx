import Election from "./election";
// import ElectionV2 from "./electionV2";

// async function GetExcelData() {
//   const res = await fetch("http://127.0.0.1:3000/api/p", {
//     method: "POST",
//   });
//   return res.json();
// }
export default async function Home() {
  // const data = await GetExcelData();

  return (
    <div className="w-full justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Election />
      {/* {data.path} */}
      {/* <ElectionV2 /> */}
    </div>
  );
}

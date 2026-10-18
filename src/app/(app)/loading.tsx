export default function Loading() {
  return (
    <main className="px-4 pt-6">
      <div className="skeleton h-7 w-44 rounded-[10px]" />
      <div className="skeleton mt-5 h-40 rounded-[12px]" />
      <div className="skeleton mt-4 h-28 rounded-[12px]" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24 rounded-[12px]" />
        ))}
      </div>
    </main>
  );
}

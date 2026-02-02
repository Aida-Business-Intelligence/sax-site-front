export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <div className="animate-pulse space-y-4">
        <div className="h-56 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-6 w-1/3 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

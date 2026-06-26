export default function ArenaBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-500/5 to-red-500/5" />
    </div>
  );
}
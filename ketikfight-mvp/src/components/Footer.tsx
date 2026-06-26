const REPO_URL = "https://github.com/mmarsal342/KetikFight";

export default function Footer() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-0.5 z-10 pointer-events-none">
      <div className="font-mono text-[7px] md:text-[9px] text-gray-600 flex items-center gap-1 md:gap-1.5 flex-wrap justify-center px-2">
        <span>© 2026 VoraLab</span>
        <span className="text-gray-700">•</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto hover:text-gray-400 transition-colors"
        >
          GitHub
        </a>
        <span className="text-gray-700">•</span>
        <span className="text-gray-600">Built by the grace of God</span>
      </div>
    </div>
  );
}

export default function LightningIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 28" fill="none" className={className}>
      <path
        d="M11.5 1L1 15.5H9.5L8 27L19 12.5H10.5L11.5 1Z"
        fill="#F97316"
        stroke="#FB923C"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LightningIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
        fill="#FF6B00"
        stroke="#FF8C00"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

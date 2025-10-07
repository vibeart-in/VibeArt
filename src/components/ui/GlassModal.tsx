interface GlassModalProps {
  width?: number;
  height?: number;
  count?: number;
  className?: string;
}

const GlassModal: React.FC<GlassModalProps> = ({
  width = 40,
  height = 600,
  count = 18,
  className = "",
}) => {
  const glassItemClasses = [
    "bg-[linear-gradient(270deg,rgba(22,22,24,0.4)_1%,rgba(0,0,0,0.4)_17%,rgba(26,26,29,0.01)_98%)]",
    "shadow-[inset_0_2px_4px_rgba(255,255,255,0.16)]",
    "backdrop-blur-[40px]",
  ].join(" ");

  const listItems = Array.from({ length: count }, (_, index) => {
    const isFirst = index === 0;
    const isLast = index === count - 1;

    const radiusClasses = [
      isFirst ? "rounded-l-[26px]" : "",
      isLast ? "rounded-r-[26px]" : "",
    ].join(" ");

    return (
      <li
        key={index}
        className={`${glassItemClasses} ${radiusClasses}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      ></li>
    );
  });

  return <ul className={`flex ${className}`}>{listItems}</ul>;
};

export default GlassModal;

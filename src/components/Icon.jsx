export function Icon({ name, size=24, fill=0, className='', style={} }) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}`,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {name}
    </span>
  );
}

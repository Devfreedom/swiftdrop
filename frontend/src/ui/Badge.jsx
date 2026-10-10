// Kit Badge: soft-background tone pill. Tones: green red amber blue purple
// indigo cyan gray. All text-on-soft pairs meet WCAG AA (see tokens.css).
export default function Badge({ tone = "gray", icon: Icon, children }) {
  return (
    <span className={`badge b-${tone}`}>
      {Icon && <Icon size={12} aria-hidden="true" />} {children}
    </span>
  );
}

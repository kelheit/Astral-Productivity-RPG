import { useTheme } from "../../contexts/ThemeContext";

export function Panel({ children, style, notch = 10, ...rest }) {
  const { theme: c } = useTheme();
  return (
    <div
      {...rest}
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        clipPath: `polygon(${notch}px 0, 100% 0, 100% calc(100% - ${notch}px), calc(100% - ${notch}px) 100%, 0 100%, 0 ${notch}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

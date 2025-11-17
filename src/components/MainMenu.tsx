type MenuItem<T extends string> = {
  key: T;
  label: string;
  disabled?: boolean;
};

type MainMenuProps<T extends string> = {
  items: MenuItem<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
};

export function MainMenu<T extends string>({
  items,
  activeKey,
  onSelect,
}: MainMenuProps<T>) {
  return (
    <nav className="mt-6 flex flex-wrap gap-2 rounded-3xl border border-white/5 bg-white/5 p-2 text-sm text-white">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={item.disabled}
          onClick={() => !item.disabled && onSelect(item.key)}
          className={`rounded-2xl px-4 py-2 transition ${
            item.disabled
              ? "cursor-not-allowed opacity-40"
              : activeKey === item.key
              ? "bg-brand-500 text-white shadow-card"
              : "bg-transparent text-slate-300 hover:bg-white/10"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

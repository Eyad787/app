export function Slider(props: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display?: string }) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-sm font-semibold text-slate-700">
        {props.label}
        {props.display !== undefined && <span className="font-normal text-slate-500" dir="ltr">{props.display}</span>}
      </span>
      <input
        type="range"
        className="w-full"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

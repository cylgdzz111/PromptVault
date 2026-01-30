import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import type { PromptMeta } from "@/lib/types";

interface MetaFormProps {
  meta: Omit<PromptMeta, "name" | "created_at">;
  onChange: (meta: Omit<PromptMeta, "name" | "created_at">) => void;
  disabled?: boolean;
}

export function MetaForm({ meta, onChange, disabled }: MetaFormProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="model">模型</Label>
        <Input
          id="model"
          placeholder="gpt-4"
          value={meta.model}
          onChange={(e) => onChange({ ...meta, model: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Temperature: {meta.temperature.toFixed(1)}</Label>
        <Slider
          value={meta.temperature}
          onValueChange={(value) => onChange({ ...meta, temperature: value })}
          min={0}
          max={1}
          step={0.1}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          placeholder="Prompt 的用途说明"
          value={meta.description}
          onChange={(e) => onChange({ ...meta, description: e.target.value })}
          disabled={disabled}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}

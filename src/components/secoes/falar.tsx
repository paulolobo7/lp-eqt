"use client";

import { toast } from "sonner";
import { PH } from "@/content/placeholders";
import { risco } from "@/content/site";
import { Icon } from "../icon";

/** No MVP o canal oficial é placeholder; o botão mostra qual será. */
export function FalarComEquatorial() {
  return (
    <button type="button" className="btn btn-alerta !min-h-[52px]" onClick={() => toast.success(risco.canalToast(PH.canal))}>
      <Icon nome="phone" />
      {risco.falar}
    </button>
  );
}

// credits-evaluator.ts
type ConditionOp = "eq" | "in" | "gte" | "lte" | "between" | "exists" | "contains";

type Condition = {
  field: string; // supports dot-paths like "meta.width"
  op: ConditionOp;
  value?: any; // optional for 'exists'
};

type PricingRule = {
  name?: string;
  priority?: number; // higher = prefer
  conditions?: Condition[];
  price_credits?: number; // fixed price in credits (1 credit = $0.01)
  price_credits_per_second?: number; // credits per second (can be fractional)
};

type CreditParameters = {
  pricing_rules: PricingRule[];
};

type EvaluateResult = {
  credits: number; // integer credits
  appliedRule?: string;
};

function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function toNumberMaybe(x: any): number {
  if (typeof x === "number") return x;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function evalCondition(cond: Condition, inputParams: Record<string, any>): boolean {
  const field = cond.field;
  const op = cond.op;
  const val = cond.value;
  const inputVal = getByPath(inputParams, field);

  if (op === "exists") {
    return inputVal !== undefined && inputVal !== null;
  }

  if (op === "eq") {
    const numA = toNumberMaybe(inputVal);
    const numB = toNumberMaybe(val);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA === numB;
    }
    return String(inputVal) === String(val);
  }

  if (op === "in") {
    if (Array.isArray(val)) {
      return val.map(String).includes(String(inputVal));
    }
    return String(inputVal) === String(val);
  }

  if (op === "gte" || op === "lte") {
    const numA = toNumberMaybe(inputVal);
    const numB = toNumberMaybe(val);
    if (Number.isNaN(numA) || Number.isNaN(numB)) return false;
    return op === "gte" ? numA >= numB : numA <= numB;
  }

  if (op === "between") {
    if (!Array.isArray(val) || val.length < 2) return false;
    const numA = toNumberMaybe(inputVal);
    const numMin = toNumberMaybe(val[0]);
    const numMax = toNumberMaybe(val[1]);
    if (Number.isNaN(numA) || Number.isNaN(numMin) || Number.isNaN(numMax)) return false;
    return numA >= numMin && numA <= numMax;
  }

  if (op === "contains") {
    if (Array.isArray(inputVal)) {
      return inputVal.map(String).includes(String(val));
    }
    if (inputVal && typeof inputVal === "object") {
      return Object.prototype.hasOwnProperty.call(inputVal, String(val));
    }
    if (typeof inputVal === "string" && (typeof val === "string" || typeof val === "number")) {
      return inputVal.includes(String(val));
    }
    return false;
  }

  return false;
}

/**
 * Main evaluator that **returns credits** (integer).
 * - creditParameters: model.credit_parameters parsed JSON
 * - inputParams: the job options/params
 */
export function evaluateCreditsFromModelParams(
  creditParameters: CreditParameters,
  inputParams: Record<string, any>,
): EvaluateResult {
  if (!creditParameters || !Array.isArray(creditParameters.pricing_rules)) {
    throw new Error("Invalid creditParameters: missing pricing_rules array");
  }

  const rules = creditParameters.pricing_rules;
  let best: {
    rule: PricingRule;
    priceCredits: number;
    specificity: number;
  } | null = null;

  const secondsCandidate =
    getByPath(inputParams, "duration") ?? getByPath(inputParams, "seconds") ?? 1;
  const seconds =
    Number(secondsCandidate) && Number(secondsCandidate) > 0 ? Number(secondsCandidate) : 1;

  for (const rule of rules) {
    const priority = typeof rule.priority === "number" ? rule.priority : 0;
    let matched = true;
    let specificity = 0;

    if (rule.conditions && Array.isArray(rule.conditions)) {
      for (const cond of rule.conditions) {
        const ok = evalCondition(cond, inputParams);
        if (!ok) {
          matched = false;
          break;
        } else {
          specificity += 1;
        }
      }
    }

    if (!matched) continue;

    let priceCredits: number | null = null;
    if (typeof rule.price_credits === "number") {
      priceCredits = rule.price_credits;
    } else if (typeof rule.price_credits_per_second === "number") {
      priceCredits = Math.ceil(rule.price_credits_per_second * seconds);
    } else {
      continue; // rule matched but has no pricing
    }

    if (!best) {
      best = { rule, priceCredits, specificity };
    } else {
      const currentPriority = typeof best.rule.priority === "number" ? best.rule.priority : 0;
      if (
        priority > currentPriority ||
        (priority === currentPriority && specificity > best.specificity)
      ) {
        best = { rule, priceCredits, specificity };
      }
    }
  }

  if (!best) {
    throw new Error(`No pricing rule matched for input ${JSON.stringify(inputParams)}`);
  }

  const credits = Math.round(best.priceCredits);
  return { credits, appliedRule: best.rule.name ?? undefined };
}

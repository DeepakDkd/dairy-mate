import cowRates from "@/app/data/rates/cow.json";
import buffaloRates from "@/app/data/rates/buffalo.json";

export function getMilkRate(type:"COW"|"BFFALO",fat:number,lr:number):number{
    let table = (type==="COW"?cowRates:buffaloRates) as Record<string, Record<string, number>>;
    return table[String(lr)]?.[fat.toFixed(1)]??null;
}
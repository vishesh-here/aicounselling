"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangePicker = void 0;
const React = __importStar(require("react"));
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const calendar_1 = require("@/components/ui/calendar");
const popover_1 = require("@/components/ui/popover");
function DateRangePicker({ value, onChange, className, }) {
    return (<div className={(0, utils_1.cn)("grid gap-2", className)}>
      <popover_1.Popover>
        <popover_1.PopoverTrigger asChild>
          <button_1.Button id="date" variant={"outline"} className={(0, utils_1.cn)("w-[300px] justify-start text-left font-normal", !value && "text-muted-foreground")}>
            <lucide_react_1.Calendar className="mr-2 h-4 w-4"/>
            {(value === null || value === void 0 ? void 0 : value.from) ? (value.to ? (<>
                  {(0, date_fns_1.format)(value.from, "LLL dd, y")} -{" "}
                  {(0, date_fns_1.format)(value.to, "LLL dd, y")}
                </>) : ((0, date_fns_1.format)(value.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
          </button_1.Button>
        </popover_1.PopoverTrigger>
        <popover_1.PopoverContent className="w-auto p-0" align="start">
          <calendar_1.Calendar initialFocus mode="range" defaultMonth={value === null || value === void 0 ? void 0 : value.from} selected={value} onSelect={(value) => onChange(value)} numberOfMonths={2}/>
        </popover_1.PopoverContent>
      </popover_1.Popover>
    </div>);
}
exports.DateRangePicker = DateRangePicker;

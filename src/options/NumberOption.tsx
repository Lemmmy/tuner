import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { ReactNode, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PickByValue } from "utility-types";
import { defaultState, OptionsState } from "../state/optionsSlice.ts";
import { RootState } from "../state/store.ts";
import { lsSetNumber } from "../utils.ts";

interface Props {
  name: keyof PickByValue<OptionsState, number>;
  label?: ReactNode;
  minValue?: number;
  maxValue?: number;
  action?: ActionCreatorWithPayload<number>;
  onChange?: (value: number) => void;
}

export function NumberOption({
  name,
  label,
  minValue,
  maxValue,
  action,
  onChange
}: Props) {
  const defaultValue = defaultState[name];
  const value = useSelector((state: RootState) => state.options[name]);
  const dispatch = useDispatch();

  const setValue = useCallback((value: number) => {
    if (action) dispatch(action(value));
    lsSetNumber(name, value);
    onChange?.(value);
  }, [dispatch, action, onChange]);

  return <div className="flex flex-row text-sm">
    {/* Label */}
    {label && <label
      htmlFor={name}
      className="mr-2 text-xs flex items-center"
    >
      {label}
    </label>}

    {/* Input */}
    <input
      type="number"
      value={value}
      min={minValue}
      max={maxValue}
      onChange={e => setValue(Number(e.target.value))}
      className="border border-black pl-1 w-20"
    />

    {/* Reset */}
    <button
      onClick={() => setValue(defaultValue)}
      className="border border-black border-l-0 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Reset"
      disabled={value === defaultValue}
    >
      ↺
    </button>
  </div>
}

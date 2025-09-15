import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";
import FormErrors from "./FormErrors";

interface InputProps {
  label?: string;
  name: string;
  required?: boolean;
  type?: string;
  hint?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  prefix?: string;
  placeholder?: string;
  autoComplete?: string;
  externalErrorMessage?: string;
  onChange?: (v: any) => void;
  onBlur?: (e: React.ChangeEvent) => void;
  endAdornment?: any;
  startAdornment?: any;
  ref?: any;
  inputProps?: any;
  value?: any;
  className?: any;
  defaultValue?: any;
  variant?: any;
  size?: any;
  shrinkLabel?: boolean;
  error?: boolean;
  helperText?: string;
  min?: any;
  max?: any;
}

export function InputFormItem(props: InputProps) {
  const {
    label,
    name,
    hint,
    type,
    placeholder,
    autoFocus,
    autoComplete,
    required,
    externalErrorMessage,
    disabled,
    endAdornment,
    startAdornment,
    inputProps,
    value,
    className,
    defaultValue,
    variant,
    size,
    shrinkLabel,
    error,
    helperText,
    min,
    max,
  } = props;

  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const errorMessage = FormErrors.errorMessage(
    name,
    errors,
    touchedFields,
    isSubmitted,
    externalErrorMessage
  );

  const shrink =
    shrinkLabel === undefined || shrinkLabel === true ? true : false;

  const { ref, ...rest } = register(name, { required });

  return (
    <TextField
      id={name}
      label={label}
      type={type}
      required={required}
      margin="normal"
      fullWidth
      variant={variant || "outlined"}
      size={size || "small"}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      InputLabelProps={shrink ? { shrink: true } : undefined}
      InputProps={{ startAdornment, endAdornment }}
      inputProps={{ ...inputProps, min, max }}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      className={className}
      error={Boolean(errorMessage) || error}
      helperText={errorMessage || hint || helperText}
      {...rest} // spread RHF props (includes name, onChange, onBlur)
      inputRef={ref} // attach ref separately
      onChange={(e) => {
        rest.onChange(e); // call RHF onChange
        props.onChange?.(e.target.value); // call your custom onChange
      }}
      onBlur={(e) => {
        rest.onBlur(e); // call RHF onBlur
        props.onBlur?.(e); // call your custom onBlur
      }}
    />
  );
}

InputFormItem.defaultProps = {
  type: "text",
  required: false,
};

InputFormItem.propTypes = {
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  type: PropTypes.string,
  label: PropTypes.string,
  hint: PropTypes.string,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  prefix: PropTypes.string,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  externalErrorMessage: PropTypes.string,
  onChange: PropTypes.func,
  startAdornment: PropTypes.any,
  endAdornment: PropTypes.any,
  className: PropTypes.any,
  defaultValue: PropTypes.string,
  varinat: PropTypes.string,
  size: PropTypes.string,
  shrinkLabel: PropTypes.bool,
  min: PropTypes.any,
  max: PropTypes.any,
};

export default InputFormItem;

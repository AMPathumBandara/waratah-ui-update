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

  return (
    <TextField
      id={name}
      //name={name}
      type={type}
      label={label}
      required={required}
      //inputRef={register({ required })}
      {...register(name, { required })}
      onChange={event => {
        props.onChange && props.onChange(event.target.value);
      }}
      onBlur={event => {
        props.onBlur && props.onBlur(event);
      }}
      margin="normal"
      fullWidth
      variant={variant || "outlined"}
      size={size || "small"}
      placeholder={placeholder || undefined}
      autoFocus={autoFocus || undefined}
      autoComplete={autoComplete || undefined}
      //endAdornment={endAdornment || undefined}
      InputLabelProps={
        shrink
          ? {
            shrink: true,
          }
          : undefined
      }
      error={Boolean(errorMessage) || error}
      helperText={errorMessage || hint || helperText}
      InputProps={{ startAdornment, endAdornment }}
      inputProps={{
        ...inputProps,
        name,
        min: min,
        max: max,
      }}
      disabled={disabled}
      value={value}
      className={className}
      defaultValue={defaultValue}
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

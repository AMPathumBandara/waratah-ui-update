// @ts-nocheck
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import AsyncCreatableSelect from "react-select/async-creatable";
import {
  components as materialUiComponents,
  styles as materialUiStyles,
} from "../From/Select/reactSelectMaterialUi";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { useFormContext } from "react-hook-form";
import FormErrors from "../From/FormErrors";

const useStyles = makeStyles(materialUiStyles as any);

interface SelectFormProps {
  name: string;
  label?: string;
  hint?: string;
  required?: boolean;
  externalErrorMessage?: string;
  mode?: string;
  isClearable?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  onChange?: (v: any, actionMeta?: any) => void;
  loadOptions?: (v: string) => Promise;
  defaultOptions?: boolean;
  cacheOptions?: boolean;
}

function SelectFormItem(props: SelectFormProps) {
  const {
    label,
    name,
    hint,
    required,
    mode,
    placeholder,
    isClearable,
    externalErrorMessage,
    isDisabled,
    loadOptions,
    defaultOptions,
    cacheOptions,
  } = props;

  const {
    register,
    errors,
    formState: { touched, isSubmitted },
    setValue,
    watch,
  } = useFormContext();

  const errorMessage = FormErrors.errorMessage(
    name,
    errors,
    touched,
    isSubmitted,
    externalErrorMessage
  );

  const originalValue = watch(name);

  useEffect(() => {
    register({ name });
  }, [register, name]);

  const value = () => {
    const { mode } = props;
    if (mode === "multiple") {
      return valueMultiple();
    } else {
      return valueOne();
    }
  };

  const valueMultiple = () => {
    if (originalValue) {
      return originalValue.map((value: any) =>
        options.find((option) => option.value === value)
      );
    }

    return [];
  };

  const valueOne = () => {
    const { options } = props;

    if (originalValue) {
      return options.find((option) => option.value === originalValue);
    }

    return "";
  };

  const handleSelect = (data: any, actionMeta: any) => {
    const { mode } = props;
    if (mode === "multiple") {
      return handleSelectMultiple(data, actionMeta);
    } else {
      return handleSelectOne(data, actionMeta);
    }
  };

  const handleSelectMultiple = (values, actionMeta) => {
    if (!values) {
      setValue(name, [], { shouldValidate: true });
      props.onChange && props.onChange([], actionMeta);
      return;
    }

    const newValue = values
      .map((data) => (data ? data.value : undefined))
      .filter(Boolean);

    setValue(name, newValue, { shouldValidate: true });
    props.onChange && props.onChange(newValue, actionMeta);
  };

  const handleSelectOne = (data, actionMeta) => {
    if (!data) {
      setValue(name, undefined, { shouldValidate: true });
      props.onChange && props.onChange(undefined, actionMeta);
      return;
    }

    setValue(name, data.value, { shouldValidate: true });
    props.onChange && props.onChange(data.value, actionMeta);
  };

  const classes = useStyles();

  const controlStyles = {
    container: (provided) => ({
      ...provided,
      width: "100%",
      marginTop: "16px",
      marginBottom: "8px",
    }),
    control: (provided) => ({
      ...provided,
      borderColor: errorMessage ? "red" : undefined,
    }),
  };

  return (
    <AsyncCreatableSelect
      styles={controlStyles}
      classes={classes}
      onChange={handleSelect}
      inputId={name}
      TextFieldProps={{
        label,
        required,
        variant: "outlined",
        fullWidth: true,
        size: "small",
        error: Boolean(errorMessage),
        helperText: errorMessage || hint,
        InputLabelProps: {
          shrink: true,
        },
      }}
      cacheOptions={cacheOptions}
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      components={materialUiComponents}
      onBlur={(event) => {
        props.onBlur && props.onBlur(event);
      }}
      isDisabled={isDisabled}
      isMulti={mode === "multiple"}
      placeholder={placeholder || ""}
      isClearable={isClearable}
      loadingMessage={() => "Loading"}
      noOptionsMessage={() => "-"}
    />
  );
}

SelectFormItem.defaultProps = {
  required: false,
  isClearable: true,
};

SelectFormItem.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array,
  label: PropTypes.string,
  hint: PropTypes.string,
  required: PropTypes.bool,
  externalErrorMessage: PropTypes.string,
  mode: PropTypes.string,
  isClearable: PropTypes.bool,
};

export default SelectFormItem;

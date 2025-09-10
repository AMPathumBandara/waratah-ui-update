// @ts-nocheck
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import {
  components as materialUiComponents,
  styles as materialUiStyles,
} from "./reactSelectMaterialUi";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { useFormContext } from "react-hook-form";
import FormErrors from "../FormErrors";

const useStyles = makeStyles(materialUiStyles as any);

interface Option {
  value: string;
  label: string;
  isFixed?: boolean;
}

interface SelectFormProps {
  name: string;
  options: Array<Option>;
  label?: string;
  hint?: string;
  required?: boolean;
  externalErrorMessage?: string;
  mode?: string;
  isClearable?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  fixed?: boolean;
  onChange?: (v: any, actionMeta?: any) => void;
}

function SelectFormItem(props: SelectFormProps) {
  const {
    label,
    name,
    hint,
    options,
    required,
    mode,
    placeholder,
    isClearable,
    externalErrorMessage,
    isDisabled,
    fixed,
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
      const values = originalValue.map((value: any) =>
        options.find((option) => option.value === value)
      );

      if (fixed && values[0]) {
        values[0].isFixed = true;
      }

      return values;
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
    if (!fixed) {
      if (!values) {
        setValue(name, [], { shouldValidate: true });
        props.onChange && props.onChange([], actionMeta);
        return;
      }
    }
    if (fixed) {
      switch (actionMeta.action) {
        case "remove-value":
        case "pop-value":
          if (actionMeta.removedValue.isFixed) {
            return values;
          }
          break;
        case "clear":
          // values = options.filter((v) => v.isFixed);
          break;
        default:
          break;
      }
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
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <Select
      styles={controlStyles}
      classes={classes}
      value={value()}
      onChange={handleSelect}
      menuPortalTarget={document.body}
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
      components={materialUiComponents}
      onBlur={(event) => {
        props.onBlur && props.onBlur(event);
      }}
      options={options}
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
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  required: PropTypes.bool,
  externalErrorMessage: PropTypes.string,
  mode: PropTypes.string,
  isClearable: PropTypes.bool,
};

export default SelectFormItem;

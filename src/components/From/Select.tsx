// @ts-nocheck
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import {
  components as materialUiComponents,
  styles as materialUiStyles,
} from "./Select/reactSelectMaterialUi";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { useFormContext } from "react-hook-form";
import FormErrors from "./FormErrors";
import CreatableSelect, { useCreatable } from "react-select/creatable";

const useStyles = makeStyles(materialUiStyles as any);

const selectStyles = makeStyles(theme => ({
  customWrapper: {},
}));

interface Option {
  value: string;
  label: string;
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
  className?: any;
  selectedValue?: any;
  defaultValue?: any;
  trimForSingleValue?: boolean;
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
    className,
    selectedValue,
    defaultValue,
    trimForSingleValue = false,
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
        options.find(option => option.value === value)
      );
    }

    return [];
  };

  const valueOne = () => {
    const { options } = props;

    if (originalValue) {
      return options.find(option => option.value === originalValue);
    }

    return "";
  };

  const handleSelect = (data: any, actionMeta: any) => {
    const { mode } = props;
    if (mode === "multiple") {
      return handleSelectMultiple(data, actionMeta);
    } else {
      if (trimForSingleValue && data?.value) {
        data = {
          ...data,
          value: data.value.replace(/\s/g, "")
        };
      }
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
      .map(data => (data ? data.value : undefined))
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
    container: provided => ({
      ...provided,
      width: "100%",
      marginTop: "16px",
      marginBottom: "8px",

      "& .MuiPaper-root": {
        boxShadow: "0px 5px 10px 0px rgb(33 33 33 / 15%)",
      },
    }),
    control: provided => ({
      ...provided,
      borderColor: errorMessage ? "red" : undefined,
    }),
  };

  return (
    <Select
      styles={controlStyles}
      classes={classes}
      value={value()}
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
      components={materialUiComponents}
      onBlur={event => {
        props.onBlur && props.onBlur(event);
      }}
      options={options}
      isDisabled={isDisabled}
      isMulti={mode === "multiple"}
      placeholder={placeholder || ""}
      isClearable={isClearable}
      loadingMessage={() => "Loading"}
      noOptionsMessage={() => "-"}
      className={className}
      defaultValue={defaultValue}
      selectedValue={selectedValue}
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
  defaultValue: PropTypes.any,
  mode: PropTypes.string,
  isClearable: PropTypes.bool,
  className: PropTypes.any,
};

export default SelectFormItem;

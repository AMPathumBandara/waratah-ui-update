import React, { useState } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DateTime } from "luxon";
import { Button, Input } from "@mui/material";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "components/From/InputField";

const useStyles = makeStyles((theme: Theme) => ({
  filterGroup: {
    "& ul": {
      listStyle: "none",
      padding: 0,
      margin: "0",
      "& li.active .status svg": {
        color: theme.palette.success.main,
      },
      "& li.active .value span:first-child": {
        color: theme.palette.success.main,
      },
      "& li.active svg": {
        color: theme.palette.success.main,
      },
    },
  },
}));

const DateformatFilter = "MMM dd yy";

const schema = yup.object().shape({
  fromDate: yup.string().required("From date is required"),
  // toDate: yup
  //   .string()
  //   .when(
  //     "fromDate",
  //     (fromDate, schema) =>
  //       fromDate &&
  //       schema.min(fromDate, "To Date should be greater than from Date")
  //   ),
});

// interface FilterObject {
//   type: string;
//   fromDate: Date;
//   toDate: Date;
// }
// interface Filters {
//   Array: FilterObject
// }

export const FilterComponent: React.FunctionComponent<any> = props => {
  const { active, options, setFiltered, type } = props;

  const classes = useStyles();

  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState<any>([]);
  const [filterType, setFilterType] = useState<any>("created_at");

  const toggleFilterDropdown = () => {
    showSort ? setShowSort(false) : setShowSort(true);
  };

  const form = useForm({
    resolver: yupResolver(schema),
  });

  const { handleSubmit } = form;

  const handleFormSubmit = (data: any) => {
    setActiveSort([
      {
        type: filterType,
        fromDate: data.fromDate,
        toDate: data.toDate,
      },
    ]);
    if (activeSort) {
      setFiltered([
        {
          type: filterType,
          fromDate: data.fromDate,
          toDate: data.toDate,
        },
      ]);
    }
  };

  const resetForm = () => {
    form.reset();
    setFiltered([]);
    setActiveSort([]);
  };

  const defaultDates = {
    //fromDate: "2017-05-24",
    //toDate: "2017-05-24",
    fromDate: activeSort ? activeSort[0]?.fromDate : undefined,
    toDate: activeSort ? activeSort[0]?.toDate : undefined,
  };

  return (
    <>
      <div>
        <div
          className={`filter-handle ${
            Object.keys(activeSort).length !== 0 ? "filterActive" : ""
          }`}
          onClick={toggleFilterDropdown}
        >
          <FilterListIcon />
          <span>Filter</span>
        </div>

        {showSort && (
          <>
            <div
              className="filter-dropdown-overlay"
              onClick={toggleFilterDropdown}
            ></div>
            <div className="filter-dropdown">
              <div className={`${classes.filterGroup} filter-group`}>
                <h5>{type} Filter by</h5>

                <ul>
                  <li
                    className={`filter-option-item`}
                    onClick={() => setFilterType("created_at")}
                  >
                    <RadioBtnIcon
                      active={filterType === "created_at" ? true : false}
                    />
                    Created Date
                  </li>
                  <li
                    className={`filter-option-item`}
                    onClick={() => setFilterType("effective_date")}
                  >
                    <RadioBtnIcon
                      active={filterType === "effective_date" ? true : false}
                    />
                    Effective Date
                  </li>
                  <li
                    className={`filter-option-item`}
                    onClick={() => setFilterType("expiration_date")}
                  >
                    <RadioBtnIcon
                      active={filterType === "expiration_date" ? true : false}
                    />
                    Expiration Date
                  </li>
                </ul>
              </div>

              <FormProvider {...form}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className="flex flex-row">
                    <div className="date-input">
                      <label>From</label>
                      <InputField
                        name="fromDate"
                        type="date"
                        variant="standard"
                        defaultValue={defaultDates.fromDate}
                        inputProps={{ "aria-label": "description" }}
                      />
                    </div>
                    <div className="date-input">
                      <label>To</label>
                      <InputField
                        name="toDate"
                        type="date"
                        min={form.watch("fromDate")}
                        variant="standard"
                        defaultValue={defaultDates.toDate}
                        inputProps={{ "aria-label": "description" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row justify-between filterBtnGroup">
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={resetForm}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      type="submit"
                    >
                      Apply
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const RadioBtnIcon: React.FunctionComponent<any> = props => {
  if (props.active) {
    return <RadioButtonCheckedIcon color="secondary" fontSize="small" />;
  } else {
    return <RadioButtonUncheckedIcon color="secondary" fontSize="small" />;
  }
};

// export const FilterComponent: React.FunctionComponent<any> = props => {
//   const { active, options, setFiltered } = props;

//   const classes = useStyles();

//   const [showSort, setShowSort] = useState(false);
//   const [activeSort, setActiveSort] = useState({});

//   const toggleFilterDropdown = () => {
//     showSort ? setShowSort(false) : setShowSort(true);
//   };

//   const onChangeFilter = (item: any) => {
//     if (item !== activeSort) {
//       setFiltered(item);
//       setActiveSort(item);
//     } else {
//       setFiltered(null);
//       setActiveSort({});
//     }
//   };

//   const isActiveSort = (item: any) => {
//     return activeSort === item ? "active" : "";
//   };

//   return (
//     <>
//       <div>
//         <div
//           className={`filter-handle ${
//             Object.keys(activeSort).length !== 0 ? "filterActive" : ""
//           }`}
//           onClick={toggleFilterDropdown}
//         >
//           <FilterListIcon />
//           <span>Filter</span>
//         </div>

//         {showSort && (
//           <>
//             <div
//               className="filter-dropdown-overlay"
//               onClick={toggleFilterDropdown}
//             ></div>
//             <div className="filter-dropdown">
//               {options?.map((f: any, i: number) => (
//                 <div key={i} className={`${classes.filterGroup} filter-group`}>
//                   <h5>{f.groupName}</h5>

//                   <ul>
//                     {f?.groupOptions?.map((m: any, i: number) => (
//                       <li
//                         className={`filter-option-item ${isActiveSort(m)}`}
//                         key={i}
//                         onClick={() => onChangeFilter(m)}
//                       >
//                         <div className="icon">
//                           <DateRangeOutlinedIcon />
//                         </div>

//                         <div className="value">
//                           <span>{m.value}</span>
//                           <span>
//                             {DateTime.local()
//                               .minus({ days: m.key })
//                               .toFormat(DateformatFilter)}{" "}
//                             - {DateTime.local().toFormat(DateformatFilter)}
//                           </span>
//                         </div>

//                         <div className="status">
//                           <CheckIcon />
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//               <div className="flex flex-row">
//                 <div className="date-input">
//                   <label>From</label>
//                   <Input name="insured_name" type="date" />
//                 </div>
//                 <div className="date-input">
//                   <label>To</label>
//                   <Input name="insured_name" type="date" />
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

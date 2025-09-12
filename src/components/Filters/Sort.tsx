import React, { useState } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import CheckIcon from "@mui/icons-material/Check";
import SortIcon from "@mui/icons-material/Sort";
import { SortAsc, SortDesc } from "components/ContentLoaders";
import Tooltip from "@mui/material/Tooltip";

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
      "& li.active .icon div.active > svg": {
        fill: theme.palette.success.main,
      },
    },
  },
}));

export const SortComponent: React.FunctionComponent<any> = props => {
  const { active, options, setSorted } = props;

  const classes = useStyles();

  const [showSort, setShowSort] = useState(false);
  const [activeSort, setActiveSort] = useState(active);

  const toggleSortDropdown = () => {
    if (showSort) {
      setShowSort(false);
    } else {
      setShowSort(true);
    }
  };

  const isActiveSort = (item: any) => {
    //@ts-ignore
    return activeSort?.key === item?.options[0]?.key ? "active" : "";
  };

  const isActiveSortChild = (child: any) => {
    if (
      child?.key === activeSort?.key &&
      child?.orderBy === activeSort?.orderBy
    ) {
      return "active";
    }
  };

  return (
    <>
      <div>
        <div className="filter-handle" onClick={toggleSortDropdown}>
          <SortIcon />
          <span>Sort</span>
        </div>
        {showSort && (
          <>
            <div
              className="filter-dropdown-overlay"
              onClick={toggleSortDropdown}
            ></div>
            <div className="filter-dropdown">
              {options.map((f: any, i: any) => (
                <div key={i} className={`${classes.filterGroup} filter-group`}>
                  <h5>{f.groupName}</h5>

                  <ul>
                    {f?.groupOptions?.map((m: any, i: number) => (
                      <li
                        className={`filter-option-item option-sort ${isActiveSort(
                          m
                        )}`}
                        key={i}
                      >
                        <div className="icon">
                          {m?.options?.map((o: any, k: any) => (
                            <Tooltip
                              title={`${
                                o.orderBy === "Desc"
                                  ? "Descending"
                                  : "Ascending"
                              }`}
                              key={k}
                            >
                              <div
                                onClick={() => {
                                  setSorted(o);
                                  setActiveSort(o);
                                }}
                                className={`${isActiveSortChild(o)}`}
                                style={{ marginRight: 5 }}
                              >
                                {o.orderBy === "Desc" ? (
                                  <SortDesc />
                                ) : (
                                  <SortAsc />
                                )}
                              </div>
                            </Tooltip>
                          ))}
                        </div>

                        <div
                          className="value"
                          onClick={() => {
                            setSorted(
                              m?.type === "date" ? m?.options[0] : m?.options[1]
                            );
                            setActiveSort(
                              m?.type === "date" ? m?.options[0] : m?.options[1]
                            );
                          }}
                        >
                          <span>{m.optionName}</span>
                          <span>
                            {/* {m.orderBy === "Asc" ? "Ascending" : "Decending"} */}
                          </span>
                        </div>

                        <div className="status">
                          <CheckIcon />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

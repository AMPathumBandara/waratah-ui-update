import React from "react";
import { createStyles, Theme, makeStyles } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ButtonGroup from "@mui/material/ButtonGroup";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Grow from "@mui/material/Grow";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import theme from "../../theme/theme";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

const useStyles = makeStyles((theme: Theme) =>
  //@ts-ignore
  createStyles({
    searchWrapper: {
      padding: "5px",
    },
    searchBlock: {
      //   padding: "0.5rem 1rem 0.5rem 1rem",
      //   backgroundColor: theme.palette.grey[100],
      //   borderRadius: 3,
    },
    searchIcon: {
      color: theme.palette.grey[500],
    },
    clearIcon: {
      color: theme.palette.grey[500],
      cursor: "pointer",
    },
    popperStyle: {
      zIndex: 999,
    },
    searchField: {
      "& input": {
        paddingTop: 8.55,
        paddingBottom: 8.5,
        fontSize: 14,
      },
    },
    btnStyle: {
      boxShadow: "none !important",
    },
  })
);

interface Option {
  id: number;
  label: String;
  key: String;
}
interface CustomTableSearchProps {
  searchValue?: any;
  setSearchValue?: any;
  searchColumn?: any;
  setSearchColumn?: any;
  tableSearchOptions: Array<Option>;
}
export default function CustomTableSearch(props: CustomTableSearchProps) {
  const {
    searchValue,
    setSearchValue,
    searchColumn,
    setSearchColumn,
    tableSearchOptions,
  } = props;

  const [searchText, setsearchText] = React.useState(searchValue);
  //const [searchValue, setSearchValue] = React.useState("");
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(searchColumn);
  if (selectedIndex === undefined) {
    setSelectedIndex(tableSearchOptions[0].key);
  }
  const handleClick = () => {
    setSearchValue(searchText, selectedIndex);
  };

  const clearSearch = () => {
    //window.location.reload();
    setSearchValue(null);
  };
  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    key: String
  ) => {
    setSelectedIndex(key);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={classes.searchWrapper}>
      <Grid
        className={classes.searchBlock}
        container
        justifyContent="flex-end"
        alignItems="center"
      >
        <TextField
          className={classes.searchField}
          variant="outlined"
          id="standard-full-width"
          style={{ margin: 8 }}
          defaultValue={searchText}
          size="small"
          placeholder={selectedIndex && `Search by ${selectedIndex}`}
          InputProps={{
            // startAdornment: (
            //   <InputAdornment position="start">
            //     <SearchIcon className={classes.searchIcon} fontSize="small" />
            //   </InputAdornment>
            // ),
            endAdornment: (
              <InputAdornment position="start">
                <ClearRoundedIcon
                  className={classes.clearIcon}
                  fontSize="small"
                  onClick={clearSearch}
                />
              </InputAdornment>
            ),
          }}
          margin="normal"
          onChange={(e: any) => {
            setsearchText(e.target.value);
          }}
          //value={searchText}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          className={classes.btnStyle}
          onClick={handleClick}
          startIcon={<SearchIcon fontSize="small" />}
        >
          Search
        </Button>
        {/* <ButtonGroup
          variant="contained"
          color="default"
          size="small"
          className={classes.btnStyle}
          ref={anchorRef}
          aria-label="split button"
        >
          <Button className={classes.btnStyle} onClick={handleClick}>
            Search
          </Button>
          <Button
            className={classes.btnStyle}
            color="default"
            size="small"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          className={classes.popperStyle}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {tableSearchOptions?.map(option => (
                      <MenuItem
                        key={option.id}
                        selected={
                          option.key === selectedIndex
                          //option.key === selectedIndex || option.id === 0
                        }
                        onClick={event => {
                          handleMenuItemClick(event, option.key);
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper> */}
      </Grid>
    </div>
  );
}

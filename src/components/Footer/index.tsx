import { colors } from "@mui/material";
import { makeStyles, Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  footerTheme: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.getContrastText(theme.palette.primary.light),
  },
}));

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <div className={`footer ${classes.footerTheme}`}>
        <div>
          <span>© {new Date().getFullYear()} VisionX</span>
        </div>
        <div>
          <span>Powered by VisionX</span>
        </div>
      </div>
    </>
  );
};

export default Footer;

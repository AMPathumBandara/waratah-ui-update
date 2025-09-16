import { Box } from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";

const Footer: React.FC = () => {
  const theme = useTheme();

  console.log(theme.palette.primary.light);

  const pageTheme = createTheme(theme, {
    custom: {
      footerTheme: {
        backgroundColor: theme.palette.primary.light,
        //color: theme.palette.getContrastText(theme.palette.primary.light),
      },
    }
  });

  return (
    <>
      <ThemeProvider theme={pageTheme}>
        <Box 
          className={`footer`}
          sx={(theme) => theme.custom.footerTheme}
        >
          <div>
            <span>© {new Date().getFullYear()} VisionX</span>
          </div>
          <div>
            <span>Powered by VisionX</span>
          </div>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default Footer;

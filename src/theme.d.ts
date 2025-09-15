// theme.d.ts
import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      root: any;
      loginContainer: SxProps<Theme> | undefined;
      formWrapper: object;
      inputStyle: object;
      switchFormBtn: object;
    };
  }
  interface ThemeOptions {
    custom?: {
      formWrapper?: object;
      inputStyle?: object;
      switchFormBtn?: object;
    };
  }
}

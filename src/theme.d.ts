// theme.d.ts
import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      primaryBgColor: SystemStyleObject<Theme>;
      sidebarHandle: SystemStyleObject<Theme>;
      footerTheme: SystemStyleObject<Theme>;
      filterGroup: SystemStyleObject<Theme>;
      signatureIndicator: SystemStyleObject<Theme>;
      applicationRow: SystemStyleObject<Theme>;
      applicationRowHeader: SystemStyleObject<Theme>;
      gridChip: SystemStyleObject<Theme>;
      count: SystemStyleObject<Theme>;
      applicationItemsWrapper: SystemStyleObject<Theme>;
      loadMore: SystemStyleObject<Theme>;
      gobalFilter: SystemStyleObject<Theme>;
      title: SystemStyleObject<Theme>;
      searchBtn: SystemStyleObject<Theme>;
      createBtn: SystemStyleObject<Theme>;
      searchField: any;
      colorPrimary: SxProps<Theme> | undefined;
      colorSecondary: SxProps<Theme> | undefined;
      colorContrast: SxProps<Theme> | undefined;
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

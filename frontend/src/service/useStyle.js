import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  select: {
    "& .MuiSelect-select": {
      color: theme.palette.text.primary,
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: theme.palette.text.primary,
    },
    "& .MuiInput-underline:hover:before": {
      borderBottomColor: theme.palette.text.primary,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: theme.palette.text.primary,
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.text.primary,
    },
  },
  menuItem: {
    color: theme.palette.text.primary,
  },
}));

export default useStyles;

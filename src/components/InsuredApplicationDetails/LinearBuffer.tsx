import React from 'react';
import { makeStyles } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { Box, Typography } from '@mui/material';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

interface Props {
  progress: number;
}

export default function LinearBuffer(props: Props) {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(props.progress);
  const [buffer, setBuffer] = React.useState(10);

  const progressRef = React.useRef(() => {});
  React.useEffect(() => {
    progressRef.current = () => {
      setProgress(props.progress);
      if (progress >= 100) {
        setProgress(1000);
        setBuffer(100);
      } else {
        const diff = Math.random() * 10;
        const diff2 = Math.random() * 10;
        setBuffer(props.progress + diff + diff2);
      }
    };
  }, [progress, props.progress]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current();
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="buffer" value={progress} valueBuffer={buffer}  />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
            progress,
          )}%`}</Typography>
        </Box>
      </Box>
      <div>Scan in Progress</div>
    </div>
  );
}
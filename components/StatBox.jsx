import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const StatBox = ({ title, subtitle, increase, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      width="100%"
      p="20px"
      borderRadius="12px"
      bgcolor={colors.primary[400]}
      boxShadow={3}
      transition="transform 0.3s, box-shadow 0.3s"
      sx={{
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
      }}
    >
      {/* Icône + Valeur (titre) sur une même ligne */}
      <Box display="flex" alignItems="center">
        <Box component="span" fontSize="40px"  mr={3}>
          {icon}
        </Box>
        <Typography variant="h3" fontWeight="bold" color="#545351">
          {title}
        </Typography>
      </Box>

      {/* Sous-titre */}
      <Typography
        variant="h4"
        color="#3c55e2"
        opacity={0.85}
        fontWeight="bold"
        mt="8px"
        mr={4}
      >
        {subtitle}
      </Typography>

      {/* Augmentation optionnelle */}
      {increase && (
        <Typography
          variant="h5"
          fontStyle="italic"
          color={colors.greenAccent[600]}
          mt="4px"
        >
          {increase}
        </Typography>
      )}
    </Box>
  );
};


export default StatBox;
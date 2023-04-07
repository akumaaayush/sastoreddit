import React from "react";
import { Box } from "@chakra-ui/react";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
  children: any;
  variant?: WrapperVariant;
}

export const Wrapper = ({
  children,
  variant = "regular",
}: WrapperProps): JSX.Element => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};

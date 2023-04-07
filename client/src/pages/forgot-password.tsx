import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React, { useState } from "react";
import InputField from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword = (): JSX.Element => {
  const [complete, setComplete] = useState(false);
  const [, ForgotPassword] = useForgotPasswordMutation();
  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values) => {
            await ForgotPassword(values);
            setComplete(true);
          }}
        >
          {({ isSubmitting }) =>
            complete ? (
              <Box> Please check your email for password change! </Box>
            ) : (
              <Form>
                <InputField
                  textarea={false}
                  name="email"
                  placeholder="email"
                  label="Email"
                  type="email"
                />
                <Button
                  mt={4}
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  Forgot Password
                </Button>
              </Form>
            )
          }
        </Formik>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);

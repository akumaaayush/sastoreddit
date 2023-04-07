import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router from "next/router";
import InputField from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import { useChangePasswordMutation } from "../../generated/graphql";
import { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

const ChangePassword: NextPage = () => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              newPassword: values.newPassword,
              token:
                typeof router.query.token === "string"
                  ? router.query.token
                  : "",
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              // worked
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                textarea={false}
                name="newPassword"
                placeholder="new password"
                label="New Password"
                type="password"
              />
              {tokenError ? (
                <Box>
                  <Box color="red">{tokenError}</Box>
                  <Link href={"/forgot-password"}>
                    Click here to get a new one
                  </Link>
                </Box>
              ) : null}
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

//if getInitialProps used then ssr is true as default so needs explicit toggling
export default withUrqlClient(createUrqlClient)(ChangePassword);

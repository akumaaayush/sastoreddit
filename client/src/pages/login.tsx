import React from "react";
import { Formik, Form } from "formik";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface loginProps {}

const Login = (): JSX.Element => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await login(values);
            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user) {
              // worked
              if (typeof router.query.next === "string") {
                router.push(router.query.next);
              } else {
                router.push("/");
              }
            }
          }}
        >
          {({ isSubmitting }) => (
            <Flex maxH={"100vh"} align={"center"} justify={"center"}>
              <Stack
                spacing={4}
                w={"full"}
                maxW={"md"}
                bg={useColorModeValue("white", "gray.700")}
                rounded={"xl"}
                boxShadow={"lg"}
                p={6}
                my={12}
              >
                <Heading
                  lineHeight={1.1}
                  fontSize={{ base: "3xl", md: "4xl" }}
                  textColor="teal"
                >
                  Login
                </Heading>
                <Form>
                  <InputField
                    textarea={false}
                    name="usernameOrEmail"
                    placeholder="username or email"
                    label="Username or Email"
                  />
                  <Box mt={4}>
                    <InputField
                      textarea={false}
                      name="password"
                      placeholder="password"
                      label="Password"
                      type="password"
                    />
                  </Box>
                  <Flex mt={4}>
                    <Link href="/forgot-password" marginLeft="auto">
                      Forgot Password?
                    </Link>
                  </Flex>
                  <Button
                    mt={4}
                    type="submit"
                    isLoading={isSubmitting}
                    colorScheme="teal"
                  >
                    Login
                  </Button>
                </Form>
              </Stack>
            </Flex>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

//references wrong graphql schema url when exported normally
export default withUrqlClient(createUrqlClient, { ssr: true })(Login);

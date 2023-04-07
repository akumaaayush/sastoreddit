import {
  Flex,
  Stack,
  useColorModeValue,
  Heading,
  Box,
  Button,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost = ({}): JSX.Element => {
  const router = useRouter();
  useIsAuth();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
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
                Create Post
              </Heading>
              <Form>
                <InputField
                  name="title"
                  placeholder="title"
                  label="Title"
                  textarea={false}
                />
                <Box mt={4}>
                  <InputField
                    name="text"
                    placeholder="text..."
                    label="Body"
                    textarea={true}
                  />
                </Box>
                <Button
                  mt={4}
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  Create Post!
                </Button>
              </Form>
            </Stack>
          </Flex>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);

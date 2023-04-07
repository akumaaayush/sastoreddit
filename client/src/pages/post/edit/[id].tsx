import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  useColorModeValue
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import useGetIntId from "../../../utils/useGetIntId";

const EditPost = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = usePostQuery({ variables: { id: intId } });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!data?.post) {
    return <Layout>Couldnt Find Post</Layout>;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values, { setErrors }) => {
          // const { error } = await createPost({ input: values });
          // if (!error) {
          //   router.push("/");
          // }
          await updatePost({ id: intId, ...values });
          router.back();
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
                Edit Post
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
                  Update Post!
                </Button>
              </Form>
            </Stack>
          </Flex>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);

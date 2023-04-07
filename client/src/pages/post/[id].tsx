import { Box, Flex, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import useGetPostFromUrl from "../../utils/useGetPostFromUrl";

const Post = () => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post.</Box>
      </Layout>
    );
  }

  if (fetching) {
    return <Layout> Loading... </Layout>;
  }
  return (
    <Layout>
      <Box mb={5}>
        <Heading mb={4}>{data.post.title}</Heading>
        {data.post.text}
      </Box>
      <EditDeletePostButtons
        id={data.post.id}
        creatorId={data.post.creator.id}
      />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
